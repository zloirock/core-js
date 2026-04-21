import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import ImportInjectorState from '@core-js/polyfill-provider/import-state';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector extends ImportInjectorState {
  #t;
  #programPath;
  // binding name → babel Identifier node (flushed imports clone it to preserve range/loc).
  // hint / source live on the base class via `#importInfoByName` + `existingPureImports`
  #idByName = new Map();
  // flush runs multiple times (pre, programExit, deferred SE) - skip already-emitted
  #flushedGlobals = new Set();
  #flushedPure = new Set();
  // `_ref` names - iterated by pruneUnusedRefs at programExit
  #refs = new Set();

  constructor({ t, programPath, pkg, mode, importStyle, absoluteImports = false }) {
    super({ absoluteImports, mode, pkg, importStyle });
    this.#t = t;
    this.#programPath = programPath;
  }

  // post-hook safety-net needs to know whether any import has already been written so
  // it doesn't switch `importStyle` mid-file and produce ESM+CJS mixed output
  get hasFlushed() {
    return this.#flushedGlobals.size > 0 || this.#flushedPure.size > 0;
  }

  isNameTaken(name) {
    if (super.isNameTaken(name)) return true;
    const { scope } = this.#programPath;
    const program = scope.getProgramParent();
    return scope.hasBinding(name) || !!program.references[name] || !!program.uids[name];
  }

  // publish every allocated UID into program.references/.uids so sibling transforms
  // don't collide via scope.generateUidIdentifierBasedOnNode
  uniqueName(prefix, extraCheck) {
    const name = super.uniqueName(prefix, extraCheck);
    const program = this.#programPath.scope.getProgramParent();
    program.references[name] = true;
    program.uids[name] = true;
    return name;
  }

  // own UID generator - Babel's scope.generateUidIdentifier strips trailing digits,
  // so after `_ref9` it would hand out `_ref` / `_ref2` instead of `_ref10` / `_ref11`,
  // colliding with earlier slots.
  // `declare=true` uses scope.push; `false` leaves the declaration to the caller (e.g.
  // destructuring extracts its own `const`). arrow-expression-body is normalized post-pass
  // by `normalizeArrowRefParams` — see there for why it can't run in-visit
  generateRef(scope, declare = true) {
    const name = this.generateRefName(n => scope.hasBinding(n));
    this.#refs.add(name);
    const id = this.#t.identifier(name);
    if (declare) scope.push({ id });
    return id;
  }

  // `scope.push` on an arrow with expression body appends the ref as a trailing parameter
  // instead of block-converting (Babel fallback when there's no block to host `var _ref;`).
  // must run post-pass: in-visit block-convert races with sibling `replaceWith` calls whose
  // container pointers still point at the pre-convert arrow.body slot — they clobber the
  // new block when they fire
  normalizeArrowRefParams() {
    if (!this.#refs.size) return;
    const t = this.#t;
    const refNames = this.#refs;
    this.#programPath.traverse({
      ArrowFunctionExpression(path) {
        const { params } = path.node;
        let n = params.length;
        while (n > 0) {
          const p = params[n - 1];
          if (p?.type !== 'Identifier' || !refNames.has(p.name)) break;
          n--;
        }
        if (n === params.length) return;
        const refParams = params.slice(n);
        path.node.params = params.slice(0, n);
        let bodyPath = path.get('body');
        if (!bodyPath.isBlockStatement()) {
          bodyPath.replaceWith(t.blockStatement([t.returnStatement(path.node.body)]));
          bodyPath = path.get('body');
        }
        bodyPath.unshiftContainer('body', t.variableDeclaration('var',
          refParams.map(p => t.variableDeclarator(t.cloneNode(p)))));
      },
    });
  }

  // drop `var _refN;` declarators left by stale visits (outer `replaceWith` discarded the
  // emission but kept the scope.push), then renumber survivors so the output matches unplugin
  pruneUnusedRefs() {
    if (!this.#refs.size) return;
    this.#programPath.scope.crawl();

    // refs pushed into function/arrow bodies live in inner scopes - program-level
    // getBinding misses them. collect from every scope, including program itself
    // (`path.traverse({ Scopable })` visits descendants only, not the path itself)
    const bindings = new Map();
    const absorb = scope => {
      for (const [name, binding] of Object.entries(scope.bindings)) {
        if (!bindings.has(name)) bindings.set(name, binding);
      }
    };
    absorb(this.#programPath.scope);
    this.#programPath.traverse({ Scopable({ scope }) { absorb(scope); } });

    for (const name of this.#refs) {
      const binding = bindings.get(name);
      if (!binding || binding.references || binding.constantViolations.length) continue;
      // `var _ref = (se(), Array)` - side-effectful init must stay even if the var is unused
      if (binding.path.node?.init) continue;
      const declPath = binding.path.parentPath;
      if (declPath.node.declarations.length === 1) declPath.remove();
      else binding.path.remove();
      this.#refs.delete(name);
    }
    if (!this.#refs.size) return;

    const taken = new Set(bindings.keys());
    for (const name of this.#refs) taken.delete(name);

    // identity set of plugin-owned binding objects guards rename against user's nested
    // shadow-binding of the same name (e.g. user's `const _ref3` inside a function body
    // while plugin's outer allocation shifts `_ref5` → `_ref3`)
    const ownedBindings = new Set();
    for (const name of this.#refs) if (bindings.has(name)) ownedBindings.add(bindings.get(name));

    // matches generateRefName: slot 1 is bare `_ref`, slot 2+ is `_ref2, _ref3, ...`
    // (skip `_ref1` per babel convention)
    const slot = i => i === 1 ? '_ref' : `_ref${ i }`;
    const renameMap = new Map();
    let i = 1;
    for (const name of this.#refs) {
      while (taken.has(slot(i))) i++;
      const target = slot(i++);
      if (name !== target) renameMap.set(name, target);
    }
    if (!renameMap.size) return;

    this.#programPath.traverse({
      Identifier(p) {
        const to = renameMap.get(p.node.name);
        if (!to || !ownedBindings.has(p.scope.getBinding(p.node.name))) return;
        p.node.name = to;
      },
    });
  }

  // base returns a string; babel consumers need an Identifier - cache one per name so
  // repeated `addPureImport` calls return clones of the same node (keeps range/loc stable)
  addPureImport(entry, hint) {
    const name = super.addPureImport(entry, hint);
    let id = this.#idByName.get(name);
    if (!id) {
      id = this.#t.identifier(name);
      this.#idByName.set(name, id);
    }
    return this.#t.cloneNode(id);
  }

  registerUserPureImport(entry, name) {
    super.registerUserPureImport(entry, name);
    this.#idByName.set(name, this.#t.identifier(name));
  }

  registerUserGlobalImport(moduleName) {
    super.registerUserGlobalImport(moduleName);
    this.#flushedGlobals.add(moduleName);
  }

  #resolvePath(subpath) {
    return resolveImportPath(this.pkg, subpath, this.absoluteImports);
  }

  #buildNodes() {
    const t = this.#t;
    let newGlobals = [...this.globalImports].filter(s => !this.#flushedGlobals.has(s));
    const newPure = [...this.pureImports].filter(([s]) => !this.#flushedPure.has(s));
    if (!newGlobals.length && !newPure.length) return null;
    newGlobals = sortByPolyfillOrder(newGlobals);
    const nodes = [];
    for (const mod of newGlobals) {
      this.#flushedGlobals.add(mod);
      const resolved = this.#resolvePath(`modules/${ mod }`);
      nodes.push(this.importStyle === 'require'
        ? t.expressionStatement(t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)]))
        : t.importDeclaration([], t.stringLiteral(resolved)));
    }
    for (const [source, name] of newPure) {
      this.#flushedPure.add(source);
      const resolved = this.#resolvePath(source);
      const id = t.cloneNode(this.#idByName.get(name));
      nodes.push(this.importStyle === 'require'
        ? t.variableDeclaration('var', [
          t.variableDeclarator(id, t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)])),
        ])
        : t.importDeclaration([t.importDefaultSpecifier(id)], t.stringLiteral(resolved)));
    }
    return nodes;
  }

  flush() {
    while (true) {
      const nodes = this.#buildNodes();
      if (!nodes) break;
      this.#programPath.unshiftContainer('body', nodes);
    }
  }

  // `scope.push({ id: _ref })` in handlers schedules a top-level `var _ref;` that lands
  // ahead of our later-unshifted imports in Babel's final body. sweep the program body
  // once (called from programExit after all pushes settle) and move the ref-only decls
  // past the import header. keeps source order lint-clean without touching pruneUnusedRefs
  reorderRefsAfterImports() {
    const { body } = this.#programPath.node;
    if (!body?.length) return;
    const isRefOnly = stmt => stmt.type === 'VariableDeclaration' && stmt.kind === 'var'
      && stmt.declarations.every(d => !d.init && d.id.type === 'Identifier' && this.#refs.has(d.id.name));
    const isImport = stmt => stmt.type === 'ImportDeclaration'
      || (stmt.type === 'ExpressionStatement' && stmt.expression?.type === 'CallExpression'
        && stmt.expression.callee?.name === 'require')
      || (stmt.type === 'VariableDeclaration'
        && stmt.declarations.every(d => d.init?.type === 'CallExpression' && d.init.callee?.name === 'require'));
    const refs = [];
    let importEnd = 0;
    for (let i = 0; i < body.length; i++) {
      if (isRefOnly(body[i])) {
        refs.push(body[i]);
        continue;
      }
      if (isImport(body[i])) {
        importEnd = i + 1;
        continue;
      }
      break;
    }
    if (!refs.length || importEnd === 0) return;
    const kept = body.filter(s => !refs.includes(s));
    // importEnd counted against original indices including refs; subtract refs that preceded it
    const insertAt = importEnd - refs.filter(r => body.indexOf(r) < importEnd).length;
    const merged = this.#t.variableDeclaration('var', refs.flatMap(s => s.declarations));
    kept.splice(insertAt, 0, merged);
    this.#programPath.node.body = kept;
  }
}

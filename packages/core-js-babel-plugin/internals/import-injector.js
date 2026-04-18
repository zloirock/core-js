import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import ImportInjectorState from '@core-js/polyfill-provider/import-state';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector extends ImportInjectorState {
  #t;
  #programPath;
  // binding name -> { source, hint, id: Identifier }. drives getPureImport() lookups
  #byName = new Map();
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

  isNameTaken(name) {
    if (super.isNameTaken(name)) return true;
    const { scope } = this.#programPath;
    const program = scope.getProgramParent();
    return scope.hasBinding(name) || !!program.references[name] || !!program.uids[name];
  }

  // publish every allocated UID into program.references/.uids so sibling transforms
  // don't collide via scope.generateUidIdentifierBasedOnNode
  uniqueName(prefix, startSuffix, minSuffix, extraCheck) {
    const name = super.uniqueName(prefix, startSuffix, minSuffix, extraCheck);
    const program = this.#programPath.scope.getProgramParent();
    program.references[name] = true;
    program.uids[name] = true;
    return name;
  }

  // own UID generator - Babel's scope.generateUidIdentifier strips trailing digits
  // and after `_ref9` would hand out `_ref0`/`_ref1` instead of `_ref10`/`_ref11`.
  // `declare=true` uses scope.push (handles arrow-body -> block promotion); `false` leaves
  // the declaration to the caller (e.g. destructuring extracts its own `const`)
  generateRef(scope, declare = true) {
    const name = this.generateRefName(n => scope.hasBinding(n));
    this.#refs.add(name);
    const id = this.#t.identifier(name);
    if (declare) scope.push({ id });
    return id;
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
        if (to) p.node.name = to;
      },
    });
  }

  // base returns a string; babel consumers need an Identifier.
  // `registerUserPureImport` seeds `hint` with the binding name (placeholder for import
  // reuse); refresh it to the real API hint so `resolveSuperImportName` can map back to
  // the original global instead of chasing a non-existent `hint === binding` global
  addPureImport(entry, hint) {
    const name = super.addPureImport(entry, hint);
    let record = this.#byName.get(name);
    if (!record) {
      record = { source: `${ this.mode }/${ entry }`, hint, id: this.#t.identifier(name) };
      this.#byName.set(name, record);
    } else if (record.hint === name) record.hint = hint;
    return this.#t.cloneNode(record.id);
  }

  registerUserPureImport(entry, name) {
    super.registerUserPureImport(entry, name);
    this.#byName.set(name, { source: `${ this.mode }/${ entry }`, hint: name, id: this.#t.identifier(name) });
  }

  registerUserGlobalImport(moduleName) {
    super.registerUserGlobalImport(moduleName);
    this.#flushedGlobals.add(moduleName);
  }

  getPureImport(name) {
    const entry = this.#byName.get(name);
    return entry ? { source: entry.source, hint: entry.hint } : null;
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
      const id = t.cloneNode(this.#byName.get(name).id);
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
}

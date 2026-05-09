import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import ImportInjectorState from '@core-js/polyfill-provider/injector-base';
import { polyfillOrderComparator, sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';

export default class ImportInjector extends ImportInjectorState {
  #t;
  #programPath;
  // binding name -> babel Identifier node (flushed imports clone it to preserve range/loc).
  // hint / source live on the base class via `#importInfoByName` + `existingPureImports`
  #idByName = new Map();
  // flush runs multiple times (pre, programExit, deferred SE) - skip already-emitted
  #flushedGlobals = new Set();
  #flushedPure = new Set();
  // emit history for canonical reorder at programExit. each `flush()` only sorts WITHIN
  // its own batch; with two flushes per file (pre / post-synth-swap) the cross-batch
  // relative order can invert vs canonical. node -> canonical key map per emit so
  // `reorderImportRegion()` can lift surviving emissions and re-sort the union in one go
  #emittedKeyByNode = new Map();
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
    // `program.globals` captures undeclared identifier uses - sloppy-mode assignment
    // targets (`_Map = foo()`) and unbound reads (`Map` as NewExpression callee) both
    // land here. without it, UID generator would pick `_Map` and collide with a user's
    // accidental `_Map = ...` sloppy global (reassigning our const import throws at runtime)
    return scope.hasBinding(name) || !!program.globals[name]
      || !!program.references[name] || !!program.uids[name];
  }

  // publish every allocated UID into program.references/.uids so sibling transforms
  // don't collide via scope.generateUidIdentifierBasedOnNode.
  // writing to babel internals is fragile but intentional: `scope.generateUid` strips
  // trailing digits (turning `_ref9` into `_ref` on next call), which breaks our skip-1
  // `_ref, _ref2, _ref3, ...` scheme. publishing to .references/.uids is the smallest
  // bridge to babel's UID tracking that preserves the scheme. `scope.crawl()` at
  // programExit may re-derive `.references`, but `.uids` sticks through crawls
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
  // callers choose:
  //   `generateDeclaredRef(scope)` - `scope.push({id})` emits `var _refN;` at the target block
  //   `generateLocalRef(scope)`    - UID only (caller emits its own `const _refN = ...` inline)
  // arrow-expression-body declarations are normalized post-pass by `normalizeArrowRefParams`
  // (see there for why it can't run in-visit)
  #generateRefId(scope) {
    const name = this.generateRefName(n => scope.hasBinding(n));
    this.#refs.add(name);
    return this.#t.identifier(name);
  }

  generateDeclaredRef(scope) {
    const id = this.#generateRefId(scope);
    scope.push({ id });
    return id;
  }

  generateLocalRef(scope) { return this.#generateRefId(scope); }

  // `scope.push` appends the ref as a trailing function parameter instead of block-converting
  // in two cases (both Babel internal behavior):
  //   - ArrowFunctionExpression with expression body: no block to host `var _ref;`
  //   - FunctionExpression in IIFE position: Babel pushes to params for callable scopes
  // both shapes need post-pass normalization to `var _ref;` in body so output stays
  // symmetric across the babel ↔ unplugin pipelines (unplugin's text-rewrite path always
  // emits `var _ref;` via scope-tracker `#scopedVars`).
  // must run post-pass: in-visit block-convert races with sibling `replaceWith` calls whose
  // container pointers still point at the pre-convert arrow.body slot - they clobber the
  // new block when they fire.
  // safety: `refNames.has(p.name)` requires the trailing param to be in `#refs`, which
  // only contains names this injector allocated. user-written `_ref` params never enter
  // `#refs` because `generateRefName` consults `scope.hasBinding` to skip them
  normalizeArrowRefParams() {
    if (!this.#refs.size) return;
    const t = this.#t;
    const refNames = this.#refs;
    const normalize = path => {
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
    };
    this.#programPath.traverse({
      ArrowFunctionExpression: normalize,
      FunctionExpression: normalize,
    });
  }

  // drop `var _refN;` declarators left by stale visits (outer `replaceWith` discarded the
  // emission but kept the scope.push), then renumber survivors so the output matches unplugin.
  // `scope.crawl()` is O(program size) but runs once per file at programExit - amortized
  // over all in-file polyfill rewrites it's negligible vs the O(N) traversal that already
  // happened. necessary: stale paths from sibling `replaceWith` leave the scope-binding map
  // out of sync with the live AST
  pruneUnusedRefs() {
    if (!this.#refs.size) return;
    this.#programPath.scope.crawl();
    // plugin-shape only: `scope.push({ id })` emits a `var _refN;` declarator. user-written
    // collisions (`let _ref5 = ...` / `const _ref5 = ...`) differ in `kind`. arrow-fn-param
    // shape is normalized to var by `normalizeArrowRefParams` BEFORE this runs. CatchClause /
    // Function params host bindings without VariableDeclaration parent and are filtered
    // separately by the prune loop's `declPath.isVariableDeclaration()` check
    const isPluginShape = binding => binding?.path?.parentPath?.node?.type === 'VariableDeclaration'
      && binding.path.parentPath.node.kind === 'var';
    // collect every plugin-shape binding across all scopes, grouped by name. first-write-wins
    // would shadow plugin's nested allocation when user has same-named outer let/const,
    // mistaking USER's binding for plugin's and renaming user code
    const byName = new Map();
    const absorb = scope => {
      for (const [name, binding] of Object.entries(scope.bindings)) {
        if (!isPluginShape(binding)) continue;
        let list = byName.get(name);
        if (!list) byName.set(name, list = []);
        // dedupe by identity - re-crawl after replaceWith can produce duplicate entries
        if (!list.includes(binding)) list.push(binding);
      }
    };
    absorb(this.#programPath.scope);
    this.#programPath.traverse({ Scopable({ scope }) { absorb(scope); } });

    for (const name of this.#refs) {
      const [binding] = byName.get(name) ?? [];
      if (!binding || binding.references || binding.constantViolations.length) continue;
      // `var _ref = (se(), Array)` - side-effectful init must stay even if the var is unused
      if (binding.path.node?.init) continue;
      const declPath = binding.path.parentPath;
      if (declPath.node.declarations.length === 1) declPath.remove();
      else binding.path.remove();
      this.#refs.delete(name);
    }
    if (!this.#refs.size) return;

    // mirror `isNameTaken`: allocation consults scope bindings PLUS program.globals/references/uids
    // to catch undeclared sloppy-mode assignments (`_ref = foo()` as implicit global) and unbound
    // reads. renumbering only scope-bindings would otherwise collapse a safely-allocated `_ref2`
    // back onto `_ref`, re-introducing the collision allocation originally avoided.
    // start with all bindings (any name in any scope counts as taken)
    const taken = new Set();
    const collectAllNames = scope => Object.keys(scope.bindings).forEach(n => taken.add(n));
    collectAllNames(this.#programPath.scope);
    this.#programPath.traverse({ Scopable({ scope }) { collectAllNames(scope); } });
    const program = this.#programPath.scope.getProgramParent();
    for (const n of Object.keys(program.globals ?? {})) taken.add(n);
    for (const n of Object.keys(program.references ?? {})) taken.add(n);
    for (const n of Object.keys(program.uids ?? {})) taken.add(n);
    for (const name of this.#refs) taken.delete(name);

    // identity set of plugin-owned binding objects guards rename against user's nested
    // shadow-binding of the same name (e.g. user's `const _ref3` inside a function body
    // while plugin's outer allocation shifts `_ref5` -> `_ref3`). every plugin-shape
    // binding for each ref name; renames target the union, missing user bindings (filtered
    // by isPluginShape during collect)
    const ownedBindings = new Set();
    for (const name of this.#refs) for (const b of byName.get(name) ?? []) ownedBindings.add(b);

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

    // sync `#refs` with post-rename names so subsequent consumers (reorderRefsAfterImports)
    // match `var _refN;` declarations against the renamed set instead of the stale originals
    for (const [from, to] of renameMap) {
      this.#refs.delete(from);
      this.#refs.add(to);
    }

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
    // guard against dead writes: a repeat registration for the same name would otherwise
    // overwrite `#idByName` with a fresh Identifier, breaking range/loc stability
    // that `addPureImport` relies on (it clones the cached node per call)
    if (!this.#idByName.has(name)) this.#idByName.set(name, this.#t.identifier(name));
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
    let newGlobals = [...this.globalImports.difference(this.#flushedGlobals)];
    const newPure = [...this.pureImports].filter(([s]) => !this.#flushedPure.has(s));
    if (!newGlobals.length && !newPure.length) return null;
    newGlobals = sortByPolyfillOrder(newGlobals);
    const nodes = [];
    for (const mod of newGlobals) {
      this.#flushedGlobals.add(mod);
      const resolved = this.#resolvePath(`modules/${ mod }`);
      const node = this.importStyle === 'require'
        ? t.expressionStatement(t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)]))
        : t.importDeclaration([], t.stringLiteral(resolved));
      nodes.push(node);
      // canonicalKey = bare module name (`es.array.at`) for compat-data lookup; pure-import
      // sources fall through to the comparator's lex tail and stay deterministic
      this.#emittedKeyByNode.set(node, mod);
    }
    for (const [source, name] of newPure) {
      this.#flushedPure.add(source);
      const resolved = this.#resolvePath(source);
      const id = t.cloneNode(this.#idByName.get(name));
      const node = this.importStyle === 'require'
        ? t.variableDeclaration('var', [
          t.variableDeclarator(id, t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)])),
        ])
        : t.importDeclaration([t.importDefaultSpecifier(id)], t.stringLiteral(resolved));
      nodes.push(node);
      this.#emittedKeyByNode.set(node, source);
    }
    return nodes;
  }

  // canonical-sort the union of all flushed plugin imports across all `flush()` calls.
  // each individual flush only sorts within its own batch; with two flushes per file
  // (visitor pre-pass / post-synth-swap), the cross-batch relative order can invert vs
  // canonical compat-data order. called from programExit AFTER all flushes - sorts only
  // emitted nodes among themselves while keeping non-emitted statements (sibling-plugin
  // helper var declarations etc.) in their ORIGINAL positions. without slot-preserving
  // permutation, `import X; const _hot = ...; import Y;` would relocate `_hot` past every
  // sorted import - silent evaluation-order change for sibling-injected helper code.
  // node-identity match (== check on `body[i] === entry.node`) avoids touching user-side
  // imports or sibling-plugin emissions interleaved in the same region
  reorderImportRegion() {
    if (this.#emittedKeyByNode.size < 2) return;
    const { body } = this.#programPath.node;
    if (!body?.length) return;
    // collect indices + sort keys of emitted slots IN-ORDER. non-emitted statements
    // (sibling helper vars, comments-as-statements, ...) keep their original positions,
    // so the sort only permutes emitted entries among the slots they already occupy
    const slots = [];
    for (let i = 0; i < body.length; i++) {
      const key = this.#emittedKeyByNode.get(body[i]);
      if (key !== undefined) slots.push({ index: i, key, node: body[i] });
    }
    if (slots.length < 2) return;
    // sort by the canonical comparator: compat-data order with lex-fallback for unknown
    // keys (pure-import sources land in the lex tail). emitted nodes have unique node
    // identity so unique-by-node holds even if two pure imports share a source string
    const sorted = [...slots].sort((a, b) => polyfillOrderComparator(a.key, b.key));
    for (let i = 0; i < slots.length; i++) {
      body[slots[i].index] = sorted[i].node;
    }
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
    // import-region members - the reorder loop accumulates `importEnd` over them and bails
    // on the first non-member. coverage:
    //   - `import ... from 'm'`
    //   - `export { x } from 'm'` / `export * from 'm'` / `export * as ns from 'm'` re-exports;
    //     TC39 module records fetch the re-exported module before evaluating user body so the
    //     re-export belongs in the import header. `ExportNamedDeclaration` without `.source`
    //     is a local re-export of an already-bound id - excluded via the `.source` check
    //   - `require('m')` ExpressionStatement (CJS bare require)
    //   - mixed-declarator `var fs = require('fs'), x = 1` - any declarator with `require(...)`
    //     counts the row in (`some` not `every`); otherwise such rows would push `var _ref;`
    //     before them, violating the `imports -> requires -> var _ref -> user code` layout
    //   - leading `'use strict'` synthesized as ExpressionStatement(StringLiteral) by sibling
    //     plugins (instead of `program.directives`); `Literal` covers the ESTree shape
    const isImportRegion = stmt => stmt.type === 'ImportDeclaration'
      || (stmt.type === 'ExportNamedDeclaration' && stmt.source)
      || stmt.type === 'ExportAllDeclaration'
      || (stmt.type === 'ExpressionStatement' && (
        (stmt.expression?.type === 'CallExpression' && stmt.expression.callee?.name === 'require')
        || stmt.expression?.type === 'StringLiteral'
        || stmt.expression?.type === 'Literal'))
      || (stmt.type === 'VariableDeclaration'
        && stmt.declarations.some(d => d.init?.type === 'CallExpression' && d.init.callee?.name === 'require'));
    const refs = [];
    const refIndices = [];
    let importEnd = 0;
    for (let i = 0; i < body.length; i++) {
      if (isRefOnly(body[i])) {
        refs.push(body[i]);
        refIndices.push(i);
        continue;
      }
      if (isImportRegion(body[i])) {
        importEnd = i + 1;
        continue;
      }
      break;
    }
    if (!refs.length || importEnd === 0) return;
    const refSet = new Set(refs);
    const kept = body.filter(s => !refSet.has(s));
    // importEnd counted against original indices including refs; subtract refs that preceded it
    let refsBeforeImportEnd = 0;
    for (const idx of refIndices) if (idx < importEnd) refsBeforeImportEnd++;
    const insertAt = importEnd - refsBeforeImportEnd;
    const merged = this.#t.variableDeclaration('var', refs.flatMap(s => s.declarations));
    kept.splice(insertAt, 0, merged);
    this.#programPath.node.body = kept;
  }
}

import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import ImportInjectorState from '@core-js/polyfill-provider/import-state';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector extends ImportInjectorState {
  #t;
  #programPath;
  // binding name -> { source, hint, id: Identifier }. `id` is cloneNode'd on each return.
  // source/hint exposed via getPureImport() -> resolveKey / resolveBindingToGlobal use them
  // to recognise post-mutation polyfill identifiers
  #byName = new Map();
  // babel runs flush multiple times during traversal (pre, programExit, deferred side
  // effects) -> track what's already been written to the program so we skip duplicates
  #flushedGlobals = new Set();
  #flushedPure = new Set();

  constructor({ t, programPath, pkg, mode, importStyle, absoluteImports = false }) {
    super({ absoluteImports, mode, pkg, importStyle });
    this.#t = t;
    this.#programPath = programPath;
  }

  // base returns the binding name (string); babel consumers expect an Identifier node
  addPureImport(entry, hint) {
    const name = super.addPureImport(entry, hint);
    return this.#t.cloneNode(this.#byName.get(name).id);
  }

  getPureImport(name) {
    const entry = this.#byName.get(name);
    return entry ? { source: entry.source, hint: entry.hint } : null;
  }

  // --- hooks ---

  isNameTaken(name) {
    if (this.usedNames.has(name)) return true;
    const { scope } = this.#programPath;
    const program = scope.getProgramParent();
    return scope.hasBinding(name) || !!program.references[name] || !!program.uids[name];
  }

  // publish the chosen UID into program.references/.uids so sibling transforms don't
  // hand the same name to a temp var via scope.generateUidIdentifierBasedOnNode
  hookNameAllocated(name) {
    const program = this.#programPath.scope.getProgramParent();
    program.references[name] = true;
    program.uids[name] = true;
  }

  hookPureImportCreated(name, source, hint) {
    this.#byName.set(name, { source, hint, id: this.#t.identifier(name) });
  }

  hookUserPureImportRegistered(name, source) {
    this.#byName.set(name, { source, hint: name, id: this.#t.identifier(name) });
  }

  hookUserGlobalImportRegistered(moduleName) {
    this.#flushedGlobals.add(moduleName);
  }

  // --- emission ---

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

import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector {
  #t;
  #programPath;
  #pkg;
  #mode;
  #absoluteImports;
  #globalImports = new Set();
  #pureImports = new Map(); // source -> Identifier node
  #flushedGlobals = new Set();
  #flushedPure = new Set();
  importStyle;

  constructor({ t, programPath, pkg, mode, importStyle, absoluteImports = false }) {
    this.#t = t;
    this.#programPath = programPath;
    this.#pkg = pkg;
    this.#mode = mode;
    this.importStyle = importStyle;
    this.#absoluteImports = absoluteImports;
  }

  #resolvePath(subpath) {
    return resolveImportPath(this.#pkg, subpath, this.#absoluteImports);
  }

  // usage-global / entry-global: collect side-effect module import
  addGlobalImport(moduleName) {
    this.#globalImports.add(moduleName);
  }

  // usage-pure: register default import, return Babel Identifier node
  addPureImport(entry, hint) {
    const source = `${ this.#mode }/${ entry }`;
    if (this.#pureImports.has(source)) return this.#t.cloneNode(this.#pureImports.get(source));
    const id = this.#programPath.scope.generateUidIdentifier(hint);
    this.#pureImports.set(source, id);
    return this.#t.cloneNode(id);
  }

  // insert all collected imports sorted by compat data order.
  // uses flushed sets to track what was already inserted - unshiftContainer may trigger
  // other plugins (e.g. CJS transform) which may cause new polyfill references to be detected,
  // so flush is called in a loop until no new imports remain.
  flush() {
    const t = this.#t;

    while (true) {
      let newGlobals = [...this.#globalImports].filter(s => !this.#flushedGlobals.has(s));
      const newPure = [...this.#pureImports].filter(([s]) => !this.#flushedPure.has(s));
      if (!newGlobals.length && !newPure.length) break;

      newGlobals = sortByPolyfillOrder(newGlobals);

      const nodes = [];
      for (const mod of newGlobals) {
        this.#flushedGlobals.add(mod);
        const resolved = this.#resolvePath(`modules/${ mod }`);
        nodes.push(this.importStyle === 'require'
          ? t.expressionStatement(t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)]))
          : t.importDeclaration([], t.stringLiteral(resolved)));
      }
      for (const [source, id] of newPure) {
        this.#flushedPure.add(source);
        const resolved = this.#resolvePath(source);
        nodes.push(this.importStyle === 'require'
          ? t.variableDeclaration('var', [
            t.variableDeclarator(t.cloneNode(id), t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)])),
          ])
          : t.importDeclaration([t.importDefaultSpecifier(t.cloneNode(id))], t.stringLiteral(resolved)));
      }
      for (let i = nodes.length - 1; i >= 0; i--) {
        this.#programPath.unshiftContainer('body', nodes[i]);
      }
    }
  }
}

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
  #usedNames = new Set();
  // polyfill identifier names -> entry source paths, lets resolveKey recognize
  // post-mutation polyfill identifiers (e.g., _Symbol$iterator -> @core-js/.../symbol/iterator)
  pureImportsByName = new Map();
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

  // usage-pure: register default import, return Babel Identifier node.
  // own UID generation: Babel's scope.generateUidIdentifier strips trailing digits from the hint
  // (`Math$log2` -> `_Math$log`), which produces misleading names for hints with numeric suffixes
  addPureImport(entry, hint) {
    const source = `${ this.#mode }/${ entry }`;
    if (this.#pureImports.has(source)) return this.#t.cloneNode(this.#pureImports.get(source));
    const sanitized = hint.replaceAll('.', '$');
    const { scope } = this.#programPath;
    let name = `_${ sanitized }`;
    let counter = 2;
    while (this.#usedNames.has(name) || scope.hasBinding(name)) {
      name = `_${ sanitized }${ counter++ }`;
    }
    this.#usedNames.add(name);
    const id = this.#t.identifier(name);
    this.#pureImports.set(source, id);
    this.pureImportsByName.set(name, source);
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
      this.#programPath.unshiftContainer('body', nodes);
    }
  }
}

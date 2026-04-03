import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector {
  #ms;
  #pkg;
  #mode;
  #absoluteImports;
  #importStyle;
  #globalImports = new Set();
  #pureImports = new Map();
  #usedNames = new Set();
  #rootScope = null;
  #refs = [];

  constructor({ ms, pkg, mode, absoluteImports, importStyle }) {
    this.#ms = ms;
    this.#pkg = pkg;
    this.#mode = mode;
    this.#absoluteImports = absoluteImports;
    this.#importStyle = importStyle;
  }

  set rootScope(scope) { this.#rootScope = scope; }

  // usage-global / entry-global: collect side-effect module import
  addGlobalImport(moduleName) {
    this.#globalImports.add(moduleName);
  }

  // usage-pure: register default import, return binding name
  addPureImport(entry, hint) {
    const key = `${ this.#mode }/${ entry }`;
    if (this.#pureImports.has(key)) return this.#pureImports.get(key);
    const sanitized = hint.replaceAll('.', '$');
    let name = `_${ sanitized }`;
    let counter = 2;
    while (this.#usedNames.has(name) || this.#rootScope?.hasBinding(name)) {
      name = `_${ sanitized }${ counter++ }`;
    }
    this.#usedNames.add(name);
    this.#pureImports.set(key, name);
    return name;
  }

  // reserve a ref name (for destructuring memoization)
  addRef(name) {
    this.#usedNames.add(name);
    this.#refs.push(name);
  }

  // generate a unique ref name
  generateRef() {
    let counter = this.#refs.length;
    let name = `_ref${ counter || '' }`;
    while (this.#usedNames.has(name) || this.#rootScope?.hasBinding(name)) {
      name = `_ref${ ++counter }`;
    }
    this.addRef(name);
    return name;
  }

  #resolvePath(subpath) {
    return resolveImportPath(this.#pkg, subpath, this.#absoluteImports);
  }

  // apply all collected imports at the top of the file
  flush() {
    let header = '';
    if (this.#refs.length) header += `var ${ this.#refs.join(', ') };\n`;
    const sortedGlobals = sortByPolyfillOrder([...this.#globalImports]);
    if (this.#importStyle === 'require') {
      for (const mod of sortedGlobals) header += `require("${ this.#resolvePath(`modules/${ mod }`) }");\n`;
      for (const [entry, name] of this.#pureImports) header += `var ${ name } = require("${ this.#resolvePath(entry) }");\n`;
    } else {
      for (const mod of sortedGlobals) header += `import "${ this.#resolvePath(`modules/${ mod }`) }";\n`;
      for (const [entry, name] of this.#pureImports) header += `import ${ name } from "${ this.#resolvePath(entry) }";\n`;
    }
    if (header) this.#ms.prepend(header);
  }
}

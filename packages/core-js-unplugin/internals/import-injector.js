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

  // find a unique name: prefix + optional suffix number, skipping taken names
  // minSuffix: smallest number to try on collision (Babel skips _ref1 -> minSuffix=2)
  #uniqueName(prefix, startSuffix, minSuffix = 1) {
    let counter = startSuffix;
    let name = counter === null ? prefix : `${ prefix }${ counter }`;
    while (this.#usedNames.has(name) || this.#rootScope?.hasBinding(name)) {
      counter = Math.max((counter ?? 0) + 1, minSuffix);
      name = `${ prefix }${ counter }`;
    }
    this.#usedNames.add(name);
    return name;
  }

  // generate a unique ref name (declared via `var` in header)
  // numbering matches Babel's generateUid: _ref, _ref2, _ref3... (no _ref1)
  generateRef() {
    const n = this.#refs.length;
    const name = this.#uniqueName('_ref', n === 0 ? null : n + 1, 2);
    this.#refs.push(name);
    return name;
  }

  // generate a unique name without declaring it (for unused destructuring bindings)
  generateUnusedName() {
    return this.#uniqueName('_unused', this.#usedNames.size || null);
  }

  #resolvePath(subpath) {
    return resolveImportPath(this.#pkg, subpath, this.#absoluteImports);
  }

  // apply all collected imports at the top of the file
  flush() {
    const lines = [];
    if (this.#refs.length) lines.push(`var ${ this.#refs.join(', ') };`);
    const sortedGlobals = sortByPolyfillOrder([...this.#globalImports]);
    if (this.#importStyle === 'require') {
      for (const mod of sortedGlobals) lines.push(`require("${ this.#resolvePath(`modules/${ mod }`) }");`);
      for (const [entry, name] of this.#pureImports) lines.push(`var ${ name } = require("${ this.#resolvePath(entry) }");`);
    } else {
      for (const mod of sortedGlobals) lines.push(`import "${ this.#resolvePath(`modules/${ mod }`) }";`);
      for (const [entry, name] of this.#pureImports) lines.push(`import ${ name } from "${ this.#resolvePath(entry) }";`);
    }
    if (lines.length) this.#ms.prepend(`${ lines.join('\n') }\n`);
  }
}

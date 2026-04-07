import { findUniqueName, resolveImportPath } from '@core-js/polyfill-provider/helpers';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector {
  #ms;
  #pkg;
  #mode;
  #absoluteImports;
  #importStyle;
  #directiveEnd = 0;
  #globalImports = new Set();
  #pureImports = new Map();
  #usedNames = new Set();
  #rootScope = null;
  #refs = [];

  constructor({ ms, pkg, mode, absoluteImports, importStyle, directiveEnd = 0 }) {
    this.#ms = ms;
    this.#pkg = pkg;
    this.#mode = mode;
    this.#absoluteImports = absoluteImports;
    this.#importStyle = importStyle;
    this.#directiveEnd = directiveEnd;
  }

  set rootScope(scope) { this.#rootScope = scope; }

  // seed the in-use name set with bindings from EVERY nested scope, not just the program root
  // estree-toolkit's program scope only sees direct bindings, so a `var _at` declared
  // inside a function would otherwise collide with our generated `_at` polyfill UID
  seedReservedNames(names) {
    for (const n of names) this.#usedNames.add(n);
  }

  // usage-global / entry-global: collect side-effect module import
  addGlobalImport(moduleName) {
    this.#globalImports.add(moduleName);
  }

  // usage-pure: register default import, return binding name
  addPureImport(entry, hint) {
    const key = `${ this.#mode }/${ entry }`;
    if (this.#pureImports.has(key)) return this.#pureImports.get(key);
    const name = this.#uniqueName(`_${ hint.replaceAll('.', '$') }`, null, 2);
    this.#pureImports.set(key, name);
    return name;
  }

  #uniqueName(prefix, startSuffix, minSuffix = 1) {
    const name = findUniqueName(prefix, startSuffix, minSuffix,
      n => this.#usedNames.has(n) || this.#rootScope?.hasBinding(n));
    this.#usedNames.add(name);
    return name;
  }

  // generate a unique _ref name; numbering matches Babel: _ref, _ref2, _ref3... (no _ref1)
  // hoisted=true (default): declared via `var` in the file header
  // hoisted=false: name only, for destructuring `const` memoization
  generateRef(hoisted = true) {
    const n = this.#refs.length;
    const name = this.#uniqueName('_ref', n === 0 ? null : n + 1, 2);
    if (hoisted) this.#refs.push(name);
    return name;
  }

  // generate a unique name without declaring it (for unused destructuring bindings)
  // numbering matches Babel: _unused, _unused2, _unused3... (no _unused1)
  generateUnusedName() {
    return this.#uniqueName('_unused', null, 2);
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
    if (!lines.length) return;
    const block = `${ lines.join('\n') }\n`;
    // insert AFTER a leading shebang line (if any) — shebang must remain at offset 0
    const insertPos = this.#prologueEnd();
    if (insertPos > 0) this.#ms.appendRight(insertPos, block);
    else this.#ms.prepend(block);
  }

  // compute end of leading BOM + shebang + directive prologue —
  // imports must be inserted AFTER all of them to remain valid
  #prologueEnd() {
    const src = this.#ms.original;
    let p = skipBom(src, 0);
    p = skipShebang(src, p);
    if (this.#directiveEnd > p) p = skipLineEnd(src, this.#directiveEnd);
    return p;
  }
}

function skipBom(src, pos) {
  return src.charCodeAt(pos) === 0xFEFF ? pos + 1 : pos;
}

function skipShebang(src, pos) {
  if (src[pos] !== '#' || src[pos + 1] !== '!') return pos;
  const nl = src.indexOf('\n', pos + 2);
  return nl === -1 ? src.length : nl + 1;
}

function skipLineEnd(src, pos) {
  if (src[pos] === '\r' && src[pos + 1] === '\n') return pos + 2;
  if (src[pos] === '\n' || src[pos] === '\r') return pos + 1;
  return pos;
}

import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import ImportInjectorState from '@core-js/polyfill-provider/import-state';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector extends ImportInjectorState {
  // two-pass pre: collect but don't emit; post flushes the combined set via snapshot inherit
  #deferImports = false;
  #directiveEnd = 0;
  #ms;
  #refs = [];
  #rootScope = null;
  // `_unusedN` sentinels left by pre's rest-destructure rebuild - post recognises them via
  // hasGeneratedUnusedName() and skips re-processing the same `{ key: _unusedN, ...rest }`
  #unusedNames = new Set();

  constructor({
    absoluteImports,
    deferImports = false,
    directiveEnd = 0,
    importStyle,
    inherit = null,
    mode,
    ms,
    pkg,
  }) {
    super({ absoluteImports, mode, pkg, importStyle });
    this.#deferImports = deferImports;
    this.#directiveEnd = directiveEnd;
    this.#ms = ms;
    if (inherit) this.#rehydrate(inherit);
  }

  #rehydrate(snap) {
    for (const g of snap.globals) this.globalImports.add(g);
    for (const [k, v] of snap.pure) this.pureImports.set(k, v);
    for (const n of snap.usedNames) this.usedNames.add(n);
    for (const n of snap.unusedNames) this.#unusedNames.add(n);
    for (const g of snap.existingGlobals) this.existingGlobalImports.add(g);
    for (const [k, v] of snap.existingPure) this.existingPureImports.set(k, v);
    this.#refs.push(...snap.refs);
  }

  // raw references - pre is discarded right after finalize, post's #rehydrate copies
  snapshot() {
    return {
      globals: this.globalImports,
      pure: this.pureImports,
      usedNames: this.usedNames,
      unusedNames: this.#unusedNames,
      refs: this.#refs,
      existingGlobals: this.existingGlobalImports,
      existingPure: this.existingPureImports,
    };
  }

  set rootScope(scope) { this.#rootScope = scope; }

  isNameTaken(name) {
    return this.usedNames.has(name) || (this.#rootScope?.hasBinding(name) ?? false);
  }

  // numbering is shared via `ImportInjectorState.generateRefName`; we track hoisted names
  // locally so flush() can emit the `var _ref, _ref2, ...;` declaration
  generateRef(hoisted = true) {
    const name = this.generateRefName();
    if (hoisted) this.#refs.push(name);
    return name;
  }

  // orphan post: snapshot lost, input is pre's output with `_ref = ...` free assignments.
  // caller filters user-owned `let _ref` declarations before invoking
  adoptOrphanRefs(orphanRefs) {
    for (const ref of orphanRefs) {
      if (!this.#refs.includes(ref)) this.#refs.push(ref);
      this.usedNames.add(ref);
    }
  }

  generateUnusedName() {
    const name = super.generateUnusedName();
    this.#unusedNames.add(name);
    return name;
  }

  hasGeneratedUnusedName(name) {
    return this.#unusedNames.has(name);
  }

  #resolvePath(subpath) {
    return resolveImportPath(this.pkg, subpath, this.absoluteImports);
  }

  // pre returns early (no emission); its transformed code carries `_ref = ...` assignments
  // without a `var _ref;`, which oxc accepts as undeclared assignment - post lands the
  // declaration before anything runs
  flush() {
    if (this.#deferImports) return;
    const lines = [];
    const newGlobals = sortByPolyfillOrder([...this.globalImports].filter(m => !this.existingGlobalImports.has(m)));
    const activePure = this.referencedInSource
      ? [...this.pureImports].filter(([, name]) => this.referencedInSource.has(name))
      : [...this.pureImports];
    // emit imports first, then the `var _ref, _ref2, ...;` declaration — imports are
    // hoisted by the engine either way, but keeping the source order lint-clean avoids
    // "statement before import" warnings in tools that don't apply ESM hoisting
    if (this.importStyle === 'require') {
      for (const mod of newGlobals) lines.push(`require("${ this.#resolvePath(`modules/${ mod }`) }");`);
      for (const [entry, name] of activePure) lines.push(`var ${ name } = require("${ this.#resolvePath(entry) }");`);
    } else {
      for (const mod of newGlobals) lines.push(`import "${ this.#resolvePath(`modules/${ mod }`) }";`);
      for (const [entry, name] of activePure) lines.push(`import ${ name } from "${ this.#resolvePath(entry) }";`);
    }
    if (this.#refs.length) lines.push(`var ${ this.#refs.join(', ') };`);
    if (!lines.length) return;
    const block = `${ lines.join('\n') }\n`;
    // MagicString can't source-map appended content, so this block is synthetic in the map
    const insertPos = this.#prologueEnd();
    if (insertPos > 0) this.#ms.appendRight(insertPos, block);
    else this.#ms.prepend(block);
  }

  // BOM already stripped by caller before MagicString is created
  #prologueEnd() {
    const src = this.#ms.original;
    let p = skipShebang(src, 0);
    if (this.#directiveEnd > p) p = skipLineEnd(src, this.#directiveEnd);
    return p;
  }
}

// CR-only line endings are legal JS separators (ES spec LineTerminator) - classic Mac
// files / manual construction. treat any of LF / CR / CRLF as the shebang terminator
function skipShebang(src, pos) {
  if (src[pos] !== '#' || src[pos + 1] !== '!') return pos;
  for (let i = pos + 2; i < src.length; i++) {
    if (src[i] === '\n') return i + 1;
    if (src[i] === '\r') return src[i + 1] === '\n' ? i + 2 : i + 1;
  }
  return src.length;
}

// advance past trailing horizontal whitespace + the first line ending so insertion lands
// on the next line - `'use strict' \n` would otherwise splice between quote and space
function skipLineEnd(src, pos) {
  let p = pos;
  while (src[p] === ' ' || src[p] === '\t') p++;
  if (src[p] === '\r' && src[p + 1] === '\n') return p + 2;
  if (src[p] === '\n' || src[p] === '\r') return p + 1;
  return p;
}

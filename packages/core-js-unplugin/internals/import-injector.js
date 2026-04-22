import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import ImportInjectorState from '@core-js/polyfill-provider/import-state';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';

export default class ImportInjector extends ImportInjectorState {
  // two-pass pre: collect but don't emit imports; post flushes the combined set via snapshot
  // inherit. refs (`var _refN;`) ARE emitted in pre regardless, so pre's output is valid in
  // strict mode (ESM) even when post is skipped — otherwise `_ref = foo()` is an undeclared
  // assignment that throws ReferenceError at runtime
  #deferImports = false;
  #directiveEnd = 0;
  #ms;
  #refs = [];
  // refs already written to `ms` by a prior flush (or inherited from pre via snapshot).
  // lets post emit only the delta so pre + post doesn't produce duplicate `var X;` lines
  #flushedRefs = new Set();
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
    // pre's `var X;` is already in post's input — don't re-emit. older snapshots
    // without `flushedRefs` fall back to all refs (over-conservative, never wrong)
    for (const r of snap.flushedRefs ?? snap.refs) this.#flushedRefs.add(r);
  }

  // shallow-copy collections so post sees a stable view even if pre keeps mutating
  // (dev-server HMR, --force, double pre)
  snapshot() {
    return {
      globals: new Set(this.globalImports),
      pure: new Map(this.pureImports),
      usedNames: new Set(this.usedNames),
      unusedNames: new Set(this.#unusedNames),
      refs: [...this.#refs],
      flushedRefs: [...this.#flushedRefs],
      existingGlobals: new Set(this.existingGlobalImports),
      existingPure: new Map(this.existingPureImports),
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

  // orphan post: snapshot lost, input is pre's output with `_ref = ...` assignments.
  // caller filters user-owned bindings; `#flushedRefs` skip avoids dup `var _ref;`
  adoptOrphanRefs(orphanRefs) {
    for (const ref of orphanRefs) {
      if (this.#flushedRefs.has(ref)) continue;
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

  // imports vs refs have different flush rules: imports are deferred in `pre` (post emits
  // the combined set via snapshot inherit); refs go out always, because `_ref = foo()`
  // without a `var _ref;` throws ReferenceError in strict-mode ESM if post skips.
  // `#flushedRefs` dedupes so post doesn't re-emit the same `var` pre already wrote
  flush() {
    const lines = [];
    if (!this.#deferImports) this.#appendImportLines(lines);
    this.#appendRefLines(lines);
    if (!lines.length) return;
    const block = `${ lines.join('\n') }\n`;
    // MagicString can't source-map appended content, so this block is synthetic in the map
    const insertPos = this.#prologueEnd();
    if (insertPos > 0) this.#ms.appendRight(insertPos, block);
    else this.#ms.prepend(block);
  }

  // `import "…"` / `var X = require("…")` — dispatched by `importStyle`. side-effect-only
  // globals first, then pure-import bindings. `referencedInSource` filters dead imports
  // when the caller tracks usage
  #appendImportLines(lines) {
    const newGlobals = sortByPolyfillOrder([...this.globalImports].filter(m => !this.existingGlobalImports.has(m)));
    const activePure = this.referencedInSource
      ? [...this.pureImports].filter(([, name]) => this.referencedInSource.has(name))
      : [...this.pureImports];
    const isRequire = this.importStyle === 'require';
    for (const mod of newGlobals) {
      const path = this.#resolvePath(`modules/${ mod }`);
      lines.push(isRequire ? `require("${ path }");` : `import "${ path }";`);
    }
    for (const [entry, name] of activePure) {
      const path = this.#resolvePath(entry);
      lines.push(isRequire ? `var ${ name } = require("${ path }");` : `import ${ name } from "${ path }";`);
    }
  }

  // `var _ref, _ref2, ...;` for refs this flush hasn't written yet. pre's emission makes
  // the output strict-mode safe; post's emission adds any new refs post allocated
  #appendRefLines(lines) {
    const newRefs = this.#refs.filter(r => !this.#flushedRefs.has(r));
    if (!newRefs.length) return;
    lines.push(`var ${ newRefs.join(', ') };`);
    for (const r of newRefs) this.#flushedRefs.add(r);
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

// land insertion on the next line: skip trailing whitespace, inline comment, line
// terminator. without comment-skip, `'use strict' // x\nfoo()` would shred the comment
function skipLineEnd(src, pos) {
  let p = pos;
  while (src[p] === ' ' || src[p] === '\t') p++;
  if (src[p] === '/' && src[p + 1] === '/') {
    while (p < src.length && src[p] !== '\n' && src[p] !== '\r') p++;
  } else if (src[p] === '/' && src[p + 1] === '*') {
    const end = src.indexOf('*/', p + 2);
    if (end === -1) return src.length;
    p = end + 2;
    while (src[p] === ' ' || src[p] === '\t') p++;
  }
  if (src[p] === '\r' && src[p + 1] === '\n') return p + 2;
  if (src[p] === '\n' || src[p] === '\r') return p + 1;
  return p;
}

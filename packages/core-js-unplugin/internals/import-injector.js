import { resolveImportPath } from '@core-js/polyfill-provider/helpers';
import ImportInjectorState, { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/import-state';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options';
import { isLineTerminator, skipBlockComment } from './plugin-helpers.js';

export default class ImportInjector extends ImportInjectorState {
  // two-pass pre: collect but don't emit imports; post flushes the combined set via snapshot
  // inherit. refs (`var _refN;`) ARE emitted in pre regardless, so pre's output is valid in
  // strict mode (ESM) even when post is skipped - otherwise `_ref = foo()` is an undeclared
  // assignment that throws ReferenceError at runtime
  #deferImports = false;
  #directiveEnd = 0;
  #ms;
  // iteration order is insertion-preserving, so emitted `var _ref, _ref2, ...;` stays stable
  #refs = new Set();
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
    getDebugOutput = null,
    importStyle,
    inherit = null,
    mode,
    ms,
    pkg,
  }) {
    super({ absoluteImports, mode, pkg, importStyle });
    this.#getDebugOutput = getDebugOutput;
    this.#deferImports = deferImports;
    this.#directiveEnd = directiveEnd;
    this.#ms = ms;
    if (inherit) this.#rehydrate(inherit);
  }

  // late-bound: outer plugin constructs debugOutput AFTER the injector. lazy lookup avoids
  // TDZ; null-safe so `phase: 'post'` direct invocations without debug still work
  #getDebugOutput;

  #rehydrate(snap) {
    // defensive `?? EMPTY` for every field: SnapshotCache persists across long-running dev
    // servers, and a plugin-version upgrade mid-session could bring in a snapshot missing
    // newer fields. treating undefined as empty matches what a fresh injector would do.
    // EMPTY_* are allocated once per rehydrate to keep iteration alloc-free when fields
    // are present (most common case)
    const EMPTY_ARR = [];
    const EMPTY_MAP = new Map();
    for (const g of snap.globals ?? EMPTY_ARR) this.globalImports.add(g);
    for (const [k, v] of snap.pure ?? EMPTY_MAP) this.pureImports.set(k, v);
    for (const n of snap.usedNames ?? EMPTY_ARR) this.usedNames.add(n);
    for (const n of snap.unusedNames ?? EMPTY_ARR) this.#unusedNames.add(n);
    for (const g of snap.existingGlobals ?? EMPTY_ARR) this.existingGlobalImports.add(g);
    for (const [k, v] of snap.existingPure ?? EMPTY_MAP) this.existingPureImports.set(k, v);
    for (const r of snap.refs ?? EMPTY_ARR) this.#refs.add(r);
    // pre's `var X;` is already in post's input - don't re-emit. older snapshots
    // without `flushedRefs` fall back to all refs (over-conservative, never wrong)
    for (const r of snap.flushedRefs ?? snap.refs ?? EMPTY_ARR) this.#flushedRefs.add(r);
    this.rehydrateSuffixState(snap.suffixState);
    this.rehydrateImportInfoByName(snap.importInfoByName);
  }

  // shallow-copy collections so post sees a stable view even if pre keeps mutating
  // (dev-server HMR, --force, double pre). `suffixState` carries the per-prefix counter
  // so post's `uniqueName` resumes at the next free slot instead of re-probing pre's N names.
  // deliberately SKIPS per-callback state (`state.scopedVars` / `arrowVars` / `destructuring`
  // / `synthSwaps`) - those track in-flight rewrites that applied in pre and whose resulting
  // text is already in the source post re-parses. re-instating them in post would double-apply
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
      suffixState: this.captureSuffixState(),
      importInfoByName: this.captureImportInfoByName(),
    };
  }

  set rootScope(scope) { this.#rootScope = scope; }

  isNameTaken(name) {
    return this.usedNames.has(name) || (this.#rootScope?.hasBinding(name) ?? false);
  }

  // numbering is shared via `ImportInjectorState.generateRefName`; we track hoisted names
  // locally so flush() can emit the `var _ref, _ref2, ...;` declaration.
  // callers choose:
  //   `generateHoistedRef()` - queues `var _refN;` at flush (caller writes `_refN = ...`)
  //   `generateLocalRef()`   - UID only (caller emits its own `const _refN = ...` inline)
  generateHoistedRef() {
    const name = this.generateRefName();
    this.#refs.add(name);
    return name;
  }

  generateLocalRef() { return this.generateRefName(); }

  // orphan post: snapshot lost, input is pre's output with `_ref = ...` assignments.
  // caller filters user-owned bindings; `#flushedRefs` skip avoids dup `var _ref;`
  // orphan refs adopted from pre's output (post sees the rewritten source but the state
  // snapshot was lost/disabled). `#flushedRefs.has(ref)` skip guards the shape covered by
  // `tests/unplugin/unit.mjs:checkAdoptOrphanRespectsFlushed`: a caller re-invokes this
  // after a re-hydrated state snapshot where `flushedRefs` records pre's already-emitted
  // var decls, so adopting the same name again would emit a duplicate `var _ref;`.
  // the guard is only reachable through `snapshot`/`#rehydrate` with manually populated
  // flushedRefs - production `!inherit` path hits it with an empty flushedRefs, but the
  // contract is part of the documented orphan-adoption API
  adoptOrphanRefs(orphanRefs) {
    // seed `#nextSuffixByPrefix['_ref']` to `max(suffixes) + 1` so subsequent
    // `generateRefName` skips the probe loop over already-adopted names. without this,
    // allocating a new `_ref` with 20 orphans in `usedNames` means 20 collision-probes
    // before landing on `_ref21`.
    // bare-slot reclaim is handled centrally by `uniqueName`: when bare is free but cache is
    // seeded past 2, allocator falls back to bare. so we always seed by max numeric tail
    let maxSuffix = 1;
    for (const ref of orphanRefs) {
      if (this.#flushedRefs.has(ref)) continue;
      this.#refs.add(ref);
      this.usedNames.add(ref);
      // extract numeric suffix via the canonical orphan-ref pattern (captures `[2-9]` or
      // `[1-9]\d+`; bare `_ref` falls under slot 1). user-shaped `_ref0`/`_ref01` reject
      // here too - we only seed the cache from slots our generator could have produced
      const match = ORPHAN_REF_PATTERN.exec(ref);
      if (match) {
        const n = match.groups.suffix ? parseInt(match.groups.suffix, 10) : 1;
        if (n > maxSuffix) maxSuffix = n;
      }
    }
    if (maxSuffix > 1) this.rehydrateSuffixState?.(new Map([['_ref', maxSuffix + 1]]));
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
    if (insertPos > 0) {
      // sibling plugin may overwrite a range that contains prologueEnd, leaving no chunk
      // boundary at insertPos for appendRight to attach to. fall through to prepend so the
      // imports still emit (loses the post-shebang/post-directive position but keeps the
      // build alive). throwing here would surface as opaque "already edited" deep in
      // MagicString without naming the cause - log the recovery so users can correlate
      // a fallback prepend with sibling-plugin range conflicts
      try {
        this.#ms.appendRight(insertPos, block);
      } catch (error) {
        this.#getDebugOutput?.()?.warn?.(`import injector fallback: appendRight at ${ insertPos } failed (${ error.message }); prepending instead`);
        this.#ms.prepend(block);
      }
    } else this.#ms.prepend(block);
  }

  // `import "…"` / `var X = require("…")` - dispatched by `importStyle`. side-effect-only
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
  // the output strict-mode safe; post's emission adds any new refs post allocated.
  // no usage-tracking filter (unlike babel-plugin's `pruneUnusedRefs`): call sites follow
  // synchronous allocate-and-use discipline - every `state.genRef()` / `generateHoistedRef()`
  // result is immediately embedded in a replacement string that goes to `transforms.add(...)`.
  // `preAllocatedGuardRef` is allocated only under conditions that guarantee consumption
  #appendRefLines(lines) {
    const newRefs = [];
    for (const r of this.#refs) if (!this.#flushedRefs.has(r)) newRefs.push(r);
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

// ES spec HashbangComment terminates on any LineTerminator (LF / CR / LS / PS). CR-only
// separators are legal (classic Mac / hand-constructed), as are LS (U+2028) / PS (U+2029)
// which a bundler may have left intact. shebangs end at the first LineTerminator
function skipShebang(src, pos) {
  if (src[pos] !== '#' || src[pos + 1] !== '!') return pos;
  for (let i = pos + 2; i < src.length; i++) {
    if (src[i] === '\r' && src[i + 1] === '\n') return i + 2;
    if (isLineTerminator(src[i])) return i + 1;
  }
  return src.length;
}

// land insertion on the next line: skip trailing whitespace and any chain of inline
// comments, then advance past the line terminator. without multi-comment handling,
// `"use strict"; /*a*/ //b\nfoo()` would land between `/*a*/` and `//b`, shredding `//b`
// (or injecting import INTO the line comment so it gets commented out at runtime)
function skipLineEnd(src, pos) {
  let p = pos;
  for (;;) {
    while (src[p] === ' ' || src[p] === '\t') p++;
    if (src[p] === '/' && src[p + 1] === '/') {
      // ES spec LineTerminator: LF / CR / LS (U+2028) / PS (U+2029). `isLineTerminator`
      // covers all four; literal `\n`/`\r` check misses LS/PS mid-source
      while (p < src.length && !isLineTerminator(src[p])) p++;
      break;
    }
    if (src[p] === '/' && src[p + 1] === '*') {
      p = skipBlockComment(src, p);
      if (p === src.length) return p;
      continue;
    }
    break;
  }
  if (src[p] === '\r' && src[p + 1] === '\n') return p + 2;
  if (isLineTerminator(src[p])) return p + 1;
  return p;
}

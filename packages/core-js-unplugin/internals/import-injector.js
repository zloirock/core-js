import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import ImportInjectorState, { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/injector-base';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';
import { isLineTerminator, skipBlockComment } from './plugin-helpers.js';

function blockify(lines) {
  return `${ lines.join('\n') }\n`;
}

// guard against adversarial Proxy on a thrown payload making `.message` access (or even
// `String(error)`) re-throw and corrupting the diagnostic. swallow secondary errors so
// `appendRight`'s failure stays attributable
function safeErrorMessage(error) {
  try {
    return error?.message ?? String(error);
  } catch {
    return '<unreadable>';
  }
}

export default class ImportInjector extends ImportInjectorState {
  // two-pass pre: collect but don't emit imports; post flushes the combined set via snapshot
  // inherit. refs (`var _refN;`) ARE emitted in pre regardless, so pre's output is valid in
  // strict mode (ESM) even when post is skipped - otherwise `_ref = foo()` is an undeclared
  // assignment that throws ReferenceError at runtime
  #deferImports = false;
  #directiveEnd = 0;
  // end position of the trailing user import / require statement (null if none). when
  // present, `var _ref;` lands AFTER user imports so the injected line doesn't sit
  // between injected and user imports (lint `import/first`). null falls back to the
  // directive prologue end - same anchor as injected imports
  #userImportEnd = null;
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
    packages = null,
    pkg,
    userImportEnd = null,
  }) {
    super({ absoluteImports, mode, pkg, importStyle, packages });
    this.#getDebugOutput = getDebugOutput;
    this.#deferImports = deferImports;
    this.#directiveEnd = directiveEnd;
    this.#userImportEnd = userImportEnd;
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
    // pre's `var X;` is already in post's input - don't re-emit. snapshot() always emits
    // `flushedRefs` (may be empty array but never undefined); EMPTY_ARR fallback covers the
    // snapshot-absent path only
    for (const r of snap.flushedRefs ?? EMPTY_ARR) this.#flushedRefs.add(r);
    this.rehydrateSuffixState(snap.suffixState);
    this.rehydrateImportInfoByName(snap.importInfoByName);
    this.rehydrateReassignedBindings(snap.reassignedBindings);
  }

  // shallow-copy collections so post sees a stable view even if pre keeps mutating
  // (dev-server HMR, --force, double pre). `suffixState` carries the per-prefix counter
  // so post's `uniqueName` resumes at the next free slot instead of re-probing pre's N names.
  // deliberately SKIPS per-callback state (ScopeTracker `scopedVars` / `bodyWraps`,
  // destructure-emitter `pendingDestructuring` / `pendingSynthSwaps`) - those track
  // in-flight rewrites that applied in pre and whose resulting text is already in the
  // source post re-parses. re-instating them in post would double-apply
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
      reassignedBindings: this.captureReassignedBindings(),
    };
  }

  set rootScope(scope) { this.#rootScope = scope; }

  isNameTaken(name) {
    return this.usedNames.has(name) || (this.#rootScope?.hasBinding(name) ?? false);
  }

  // numbering is shared via `ImportInjectorState.generateRefName`; we track declared names
  // locally so flush() can emit the `var _ref, _ref2, ...;` declaration. callers choose:
  //   `generateDeclaredRef()` - queues `var _refN;` at flush (caller writes `_refN = ...`).
  //                             same abstract role as babel's `scope.push({id})`-backed
  //                             `generateDeclaredRef(scope)`; see injector-base.js docstring
  //   `generateLocalRef()`    - UID only (caller emits its own `const _refN = ...` inline)
  generateDeclaredRef() {
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
      // validate ORPHAN_REF_PATTERN BEFORE mutating refs/usedNames - the orphan-adoption
      // contract only accepts generator-shaped names (`_ref`, `_ref2..N`) that
      // `generateRefName` produces. a non-conforming `weirdName` slipping through would join
      // `#refs` and `flush` would emit `var weirdName;` from a stale snapshot, polluting output
      const match = ORPHAN_REF_PATTERN.exec(ref);
      if (!match) continue;
      this.#refs.add(ref);
      this.usedNames.add(ref);
      // extract numeric suffix (pattern caps it below Number.MAX_SAFE_INTEGER; bare `_ref` -> slot 1)
      const n = match.groups.suffix ? parseInt(match.groups.suffix, 10) : 1;
      if (n > maxSuffix) maxSuffix = n;
    }
    if (maxSuffix > 1) this.rehydrateSuffixState(new Map([['_ref', maxSuffix + 1]]));
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
  // `#flushedRefs` dedupes so post doesn't re-emit the same `var` pre already wrote.
  // imports emit at the directive prologue end (top-of-file); refs emit after the trailing
  // user import (when present) so the `import 'core-js/...' / import {x} from 'user' / var _ref;`
  // layout matches babel-plugin's `reorderRefsAfterImports` and lint `import/first` stays clean
  flush() {
    const imports = this.#deferImports ? [] : this.#collectImportLines();
    const refs = this.#collectRefLines();
    if (!imports.length && !refs.length) return;
    const importPos = this.#prologueEnd();
    const src = this.#ms.original;
    // a trailing same-line comment on the last user import (`import x from 'y' // c`) sits past
    // `#userImportEnd` (oxc's stmt.end stops at the source token, before the comment), so anchoring
    // `var _ref;` there would split the comment off its import onto a line below the ref block.
    // skip the trailing comment chain so the ref block lands after it - the comment stays attached
    const refPos = typeof this.#userImportEnd === 'number' ? skipTrailingComments(src, this.#userImportEnd) : importPos;
    const lead = needsLeadingNewlineAt(src, importPos) ? '\n' : '';
    // when imports and refs share the same anchor, combine into one block so MagicString
    // preserves the `[imports, refs]` order; multiple `appendRight` calls at the same
    // position can re-order vs prepend semantics
    if (importPos === refPos) return this.#emit(lead + blockify([...imports, ...refs]), importPos);
    const importsBlock = imports.length ? lead + blockify(imports) : '';
    // refPos lands right after the trailing user import. when that import omits its `;`
    // (ASI), refPos sits on whatever token followed - we must prefix our `var _ref;` block
    // with `\n` to terminate the prior statement. otherwise `import x from "y"var _ref;`
    // bombs the next parse pass with SyntaxError. additionally, when the next char at refPos
    // is itself a line terminator (e.g. ASI-ended import + trailing newline), `blockify`'s
    // trailing `\n` would double-stack against the existing terminator and produce a cosmetic
    // blank line between our injection and the next user line - trim it in that case
    let refsBlock = '';
    if (refs.length) {
      const needsLead = needsRefLeadingNewlineAt(src, refPos);
      const nextIsTerminator = refPos < src.length && isLineTerminator(src[refPos]);
      const block = nextIsTerminator ? refs.join('\n') : blockify(refs);
      refsBlock = needsLead ? `\n${ block }` : block;
    }
    // ordered fallback: when individual `appendRight` fails AND we have to `prepend`, the
    // emission order must stay `imports -> refs`. multiple `prepend` calls reverse insertion
    // order (later prepend wins position), so a naive per-call fallback would emit `var _ref;`
    // BEFORE `import 'x';`. accumulate failed blocks into a single prepend that preserves
    // source order. successful appendRight paths already land at correct positions
    let pendingPrepend = '';
    if (importsBlock) pendingPrepend = this.#emitOrDefer(importsBlock, importPos, pendingPrepend);
    if (refsBlock) pendingPrepend = this.#emitOrDefer(refsBlock, refPos, pendingPrepend);
    if (pendingPrepend) this.#ms.prepend(pendingPrepend);
  }

  // sibling plugin may overwrite a range that contains the insert position, leaving no
  // chunk boundary for appendRight to attach to. instead of immediately prepending (which
  // would reverse `[imports, refs]` order when both legs fall back), accumulate the failed
  // block into the caller's `pendingPrepend` buffer; the caller emits a single ordered
  // prepend at the end. logs the fallback so users can correlate with sibling-plugin range
  // conflicts. MagicString can't source-map appended content, so the block is synthetic
  // in the map regardless of which path runs
  #emitOrDefer(block, insertPos, pendingPrepend) {
    if (insertPos > 0) {
      try {
        this.#ms.appendRight(insertPos, block);
        return pendingPrepend;
      } catch (error) {
        this.#getDebugOutput?.()?.warn?.(`import injector fallback: appendRight at ${ insertPos } failed (${ safeErrorMessage(error) }); deferring to ordered prepend`);
      }
    }
    return pendingPrepend + block;
  }

  // single-emission appendRight + prepend fallback. used for the same-anchor combined-block
  // path where ordering is intrinsic to the block content (one call, one position)
  #emit(block, insertPos) {
    if (insertPos > 0) {
      try {
        this.#ms.appendRight(insertPos, block);
        return;
      } catch (error) {
        this.#getDebugOutput?.()?.warn?.(`import injector fallback: appendRight at ${ insertPos } failed (${ safeErrorMessage(error) }); prepending instead`);
      }
    }
    this.#ms.prepend(block);
  }

  // `import "..."` / `var X = require("...")` - dispatched by `importStyle`. side-effect-only
  // globals first, then pure-import bindings. `referencedInSource` filters dead imports
  // when the caller tracks usage
  #collectImportLines() {
    const lines = [];
    const newGlobals = sortByPolyfillOrder([...this.globalImports.difference(this.existingGlobalImports)]);
    // drop sources already imported in the current text (keyed by source path). symmetric with
    // the global `difference(existingGlobalImports)` above. needed when `pureImports` carries a
    // source that's ALSO present as an existing import - the pre+post inherit path: pre emits its
    // pure imports inline AND seeds `pureImports` via the snapshot, then post re-scans the inline
    // line into `existingPureImports`; without this filter post would re-emit a second identical
    // line. `addPureImport`'s own early-return covers the single-pass case but never sees the
    // inherited `pureImports` entries
    const activePure = [...this.pureImports].filter(([source, name]) => !this.existingPureImports.has(source)
      && (!this.referencedInSource || this.referencedInSource.has(name)));
    // canonical-sort pure imports by source path (lex). insertion order alone produces
    // batch-dependent layout that diverges across plugins / files with different timing
    // of registrations; babel-plugin canonicalises the union of all flushed imports too
    activePure.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    const isRequire = this.importStyle === 'require';
    for (const mod of newGlobals) {
      const path = this.#resolvePath(`modules/${ mod }`);
      lines.push(isRequire ? `require("${ path }");` : `import "${ path }";`);
    }
    for (const [entry, name] of activePure) {
      const path = this.#resolvePath(entry);
      lines.push(isRequire ? `var ${ name } = require("${ path }");` : `import ${ name } from "${ path }";`);
    }
    return lines;
  }

  // `var _ref, _ref2, ...;` for refs this flush hasn't written yet. pre's emission makes
  // the output strict-mode safe; post's emission adds any new refs post allocated.
  // no usage-tracking filter (unlike babel-plugin's `pruneUnusedRefs`): call sites follow
  // synchronous allocate-and-use discipline - every `scopeTracker.genRef()` /
  // `generateDeclaredRef()` result is immediately embedded in a replacement string that goes
  // to `transforms.add(...)`. `preAllocatedGuardRef` is allocated only under conditions that
  // guarantee consumption
  #collectRefLines() {
    const newRefs = [...this.#refs.difference(this.#flushedRefs)];
    if (!newRefs.length) return [];
    for (const r of newRefs) this.#flushedRefs.add(r);
    return [`var ${ newRefs.join(', ') };`];
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

// insertion needs an explicit `\n` prefix when `pos` is NOT at the start of a line - blockify-
// emit appends at `pos`, so without a separator the block concatenates onto the prior token.
// two cases: (1) shebang-only / EOF anchor (`#!/usr/bin/env nodeimport "core-js/...";` syntax
// error), and (2) a directive line carrying trailing code / comments past which `skipLineEnd`
// found no terminator, so `pos` sits mid-line and the import would otherwise jam onto the
// directive line. detection: pos is past file start and the previous char is not a line terminator
function needsLeadingNewlineAt(src, pos) {
  return pos > 0 && !isLineTerminator(src[pos - 1]);
}

// ref-block emission lands at `refPos` (right after the trailing user import). when that
// user import ends without `;` (ASI), refPos sits on whatever token came next - inserting
// `var _ref;` here would fuse the prior statement into `import x from "y"var _ref;` and
// crash the next parse pass. detection: prev char is not a line terminator (a `;` terminator
// still needs the newline so the memo doesn't stick to the import line).
// blank-line trade-off accepted: when next char is already `\n`, the inserted leading `\n`
// produces a stylistic blank line BEFORE the block, but the terminator is still required -
// removing it would let `import "y"<block>` fuse the import into our `var _ref` declaration
function needsRefLeadingNewlineAt(src, pos) {
  if (pos <= 0) return false;
  // a leading `\n` puts the `var _ref;` memo on its own line. needed unless the prior char is
  // already a line terminator (refPos sits at a newline). a `;` terminator still needs it - without
  // the newline the memo sticks to the trailing import line (`import x from "y";var _ref;`)
  return !isLineTerminator(src[pos - 1]);
}

// skip trailing whitespace + any chain of inline comments from `pos`, returning the position
// where the chain ends (at the line terminator, or the first real-code char), WITHOUT consuming
// the terminator. shared by `skipLineEnd` (which then advances past the LT) and the ref-block
// anchor (which keeps a trailing same-line comment attached to its user import rather than
// splitting `var _ref;` between the import and its comment)
function skipTrailingComments(src, pos) {
  let p = pos;
  for (;;) {
    while (src[p] === ' ' || src[p] === '\t') p++;
    if (src[p] === '/' && src[p + 1] === '/') {
      // ES spec LineTerminator: LF / CR / LS (U+2028) / PS (U+2029). `isLineTerminator`
      // covers all four; literal `\n`/`\r` check misses LS/PS mid-source
      while (p < src.length && !isLineTerminator(src[p])) p++;
      return p;
    }
    if (src[p] === '/' && src[p + 1] === '*') {
      p = skipBlockComment(src, p);
      if (p === src.length) return p;
      continue;
    }
    return p;
  }
}

// land insertion on the next line: skip trailing whitespace and any chain of inline
// comments, then advance past the line terminator. without multi-comment handling,
// `"use strict"; /*a*/ //b\nfoo()` would land between `/*a*/` and `//b`, shredding `//b`
// (or injecting import INTO the line comment so it gets commented out at runtime)
function skipLineEnd(src, pos) {
  const p = skipTrailingComments(src, pos);
  if (src[p] === '\r' && src[p + 1] === '\n') return p + 2;
  if (isLineTerminator(src[p])) return p + 1;
  return p;
}

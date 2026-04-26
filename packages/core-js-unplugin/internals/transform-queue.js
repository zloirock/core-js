// is [start, end] strictly contained within any range in the start-sorted array?
// (equal ranges are not considered contained - both transforms must be applied).
// binary search + prefix maxEnd resolves in O(log n); falls through to a linear scan only
// when the max end exactly equals query.end (strictness then reduces to r.start < query.start)
function isStrictlyContained(ranges, start, end, prefixMaxEnd) {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ranges[mid].start <= start) lo = mid + 1;
    else hi = mid - 1;
  }
  if (lo === 0) return false;
  const maxEnd = prefixMaxEnd[lo - 1];
  if (maxEnd > end) return true;
  if (maxEnd < end) return false;
  for (let i = lo - 1; i >= 0; i--) {
    const r = ranges[i];
    if (r.end >= end && r.start < start) return true;
  }
  return false;
}

// non-overlapping jumpsize - polyfill needles embed syntactic delimiters (`.`, `(`,
// identifiers) that cannot self-overlap. empty needle is a caller bug - guard so
// indexOf('', ...) doesn't infinite-loop (pos never advances)
export function countOccurrences(haystack, needle, rangeStart = 0, rangeEnd = haystack.length) {
  if (!needle.length) return 0;
  let count = 0;
  for (let pos = haystack.indexOf(needle, rangeStart);
    pos !== -1 && pos + needle.length <= rangeEnd;
    pos = haystack.indexOf(needle, pos + needle.length)) count++;
  return count;
}

// when composing `Array.from(x).reduce(Array.from)`, filter consumes the leftmost `Array.from`
// during its substitution, so the rightmost inner's nth must decrement past that slot
function consumedOccurrencesBefore(originalSlice, needle, innerStartAbs, outerStart, processedRanges) {
  let consumed = 0;
  for (const r of processedRanges) {
    if (r.end <= innerStartAbs) {
      consumed += countOccurrences(originalSlice, needle, r.start - outerStart, r.end - outerStart);
    }
  }
  return consumed;
}

// replace the `n`-th (0-based) occurrence of `needle` in `str`; return `str` unchanged if not found.
// negative `n` (possible if count math underflows - defensive) yields no replacement rather than
// a corrupt slice from `str.slice(0, -1) + replacement + ...` falling through the empty loop.
// empty needle: `indexOf('', 0)` returns 0 on any string, so without a guard we'd splice
// `replacement` in at position 0 repeatedly - silent corruption. bail early instead
function replaceNthOccurrence(str, needle, replacement, n) {
  if (n < 0 || !needle.length) return str;
  let idx = -1;
  for (let i = 0; i <= n; i++) {
    idx = str.indexOf(needle, idx + 1);
    if (idx === -1) return str;
  }
  return str.slice(0, idx) + replacement + str.slice(idx + needle.length);
}

// `?.(` / `?.[` drop BOTH chars, `?.prop` keeps `.` - naive `replaceAll('?.', '.')`
// produces `.(` that never matches the `(` emitted by the inner transform.
// raw text transform - not AST-aware. `?.` inside a template literal (`` `a?.b` ``) or a
// regular string would also be rewritten. in practice the needle is always a slice of an
// AST MemberExpression / CallExpression range where strings can't appear in the optional
// position - the malformed-needle risk is bounded by the caller supplying correct ranges.
// scan past whitespace before classifying: source can hold `obj ?. (args)` or `obj?.\n[i]`
// (parsers tolerate whitespace between `?.` and the token); single-char lookahead would
// miss those and emit `obj. (args)` instead of `obj (args)`
export function deoptionalizeNeedle(needle) {
  return needle.replaceAll('?.', (_, offset) => {
    let i = offset + 2;
    while (i < needle.length && WS_RE.test(needle[i])) i++;
    const next = needle[i];
    return next === '(' || next === '[' ? '' : '.';
  });
}
// fast single-char whitespace test - covers space, tab, CR, LF; no need for the full
// `\s` lexicon (vertical tabs, exotic Unicode whitespace) because parsers normalize
// optional-chain tokens through standard ECMAScript whitespace
const WS_RE = /\s/;

// try needle shapes: raw slice -> deoptionalized -> guardRef-rewritten
// (`rootRaw -> guardRef + deopt`) for nested polyfills sharing a chain root
// after-char gate: only consider `needle.startsWith(rootRaw)` valid when the char after
// `rootRaw` is a structural token delimiter (`.`, `?`, `[`, `(`), not an identifier
// continuation. prevents `foo.barBaz` being treated as a `foo.bar` root match
function hasRootBoundary(needle, rootLength) {
  if (needle.length === rootLength) return true;
  const next = needle[rootLength];
  return next === '.' || next === '?' || next === '[' || next === '(';
}

function substituteInner(content, needle, replacement, nth, outerHint) {
  const candidates = [needle];
  if (needle.includes('?.')) candidates.push(deoptionalizeNeedle(needle));
  if (outerHint?.rootRaw && outerHint.guardRef
    && needle.startsWith(outerHint.rootRaw) && hasRootBoundary(needle, outerHint.rootRaw.length)) {
    candidates.push(outerHint.guardRef + deoptionalizeNeedle(needle.slice(outerHint.rootRaw.length)));
  }
  for (const candidate of candidates) {
    const result = replaceNthOccurrence(content, candidate, replacement, nth);
    if (result !== content) return { content: result, found: true };
  }
  return { content, found: false };
}

// binary search: first index with ranges[i].start >= target
function lowerBound(ranges, target) {
  let lo = 0;
  let hi = ranges.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ranges[mid].start < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// binary search: first index with ranges[i].start > target
// used by `add` to append new equal-start entries AFTER existing ones so #sorted
// preserves insertion order within each start - matters for the compose loop where
// later-added duplicate-range transforms (arrow wrappers) must run after their base
function upperBound(ranges, target) {
  let lo = 0;
  let hi = ranges.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ranges[mid].start <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// equal-range merge: arrow body wrapper + inner polyfill share the same [start, end].
// the "wrapper" contains the original source as substring; the "inner" doesn't.
// function-form replace bypasses `$&` / `$1` / `$'` / `` $` `` interpretation if `inner`
// happens to contain those tokens (e.g. user source with `$&` or polyfill names with `$`).
// invariant: outer transforms emit at most one verbatim copy of the inner needle (the
// arrow-wrapper / synth-swap shapes preserve the source slice exactly once). a wrapper
// containing the needle multiple times would silently ignore later occurrences here -
// no caller currently produces that shape, but watch this if a new outer transform shape
// emits the original needle in two slots
export function mergeEqualRange(a, b, originalNeedle, range = null) {
  const aFirst = a.indexOf(originalNeedle);
  const wrapper = aFirst !== -1 ? a : b;
  const inner = aFirst !== -1 ? b : a;
  const first = aFirst !== -1 ? aFirst : wrapper.indexOf(originalNeedle);
  // file/range context lets callers report "[fileId] at offsets [s,e)" instead of just the
  // raw needle - the latter is useless for users trying to pinpoint the conflicting source
  const rangeStr = range ? ` at [${ range.start },${ range.end })` : '';
  // contract: at least one side wraps the original source. a regression that breaks this
  // invariant would silently drop the wrapper text and emit only the inner replacement.
  // production callers (synth-swap, arrow-body wrap) always preserve the needle in exactly
  // one slot - the throw makes a future callsite that drops both copies fail loudly
  if (first === -1) {
    throw new Error(`mergeEqualRange invariant${ rangeStr }: needle missing from both transforms (needle=${ JSON.stringify(originalNeedle) })`);
  }
  // assert single-occurrence invariant: if a new outer-transform shape emits the needle
  // twice, only the first slot would be swapped in silently; flag the regression loudly
  // instead of shipping corrupt output. slice+includes allocates once on the assert path
  // (rare miss) instead of pulling in a second `indexOf` with a start position
  if (wrapper.slice(first + originalNeedle.length).includes(originalNeedle)) {
    throw new Error(`mergeEqualRange invariant${ rangeStr }: wrapper contains needle >1 times (needle=${ JSON.stringify(originalNeedle) })`);
  }
  // hand-built slice-splice avoids `String.prototype.replace`'s `$&` / `$'` / `` $` `` /
  // `$n` interpretation if `inner` contains those tokens (user source with `$&` or polyfill
  // names with `$`). also one fewer scan of `wrapper` than a non-regex replace would cost
  return wrapper.slice(0, first) + inner + wrapper.slice(first + originalNeedle.length);
}

// composite key for the (start, end) range index
const rangeKey = (start, end) => `${ start }|${ end }`;

// incremental prefix-max maintenance after splice. prefix max is monotonic non-decreasing:
// once the walk hits a stale slot that already covers the change, trailing slots stay correct
function updatePrefixMaxOnInsert(sorted, prefixMaxEnd, pos) {
  const prev = pos > 0 ? prefixMaxEnd[pos - 1] : -1;
  const newEnd = sorted[pos].end;
  prefixMaxEnd.splice(pos, 0, Math.max(newEnd, prev));
  if (newEnd > prev) for (let i = pos + 1; i < prefixMaxEnd.length; i++) {
    if (prefixMaxEnd[i] >= newEnd) return;
    prefixMaxEnd[i] = newEnd;
  }
}

function updatePrefixMaxOnRemove(sorted, prefixMaxEnd, si, removedEnd) {
  prefixMaxEnd.splice(si, 1);
  const prev = si > 0 ? prefixMaxEnd[si - 1] : -1;
  // removed end wasn't the contributor -> shifted-left stale values are already correct
  if (removedEnd <= prev) return;
  let running = prev;
  for (let i = si; i < sorted.length; i++) {
    if (sorted[i].end > running) running = sorted[i].end;
    if (prefixMaxEnd[i] === running) return;
    prefixMaxEnd[i] = running;
  }
}

// append to a Map<K, V[]>, creating the bucket on first insert
function pushOrInit(map, key, value) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

// remove `value` from `map[key]`; drop the key if the bucket goes empty
function removeFrom(map, key, value) {
  const list = map.get(key);
  const idx = list?.indexOf(value) ?? -1;
  if (idx === -1) return;
  if (list.length === 1) map.delete(key);
  else list.splice(idx, 1);
}

// rewriteHint factory: packages the composition data that `substituteInner` needs to
// reconstruct inner needles when an outer transform rewrote the chain root. caller passes
// non-null `rootRaw` + `guardRef` together (guard guarantees `rootRaw` was replaced);
// `deoptPositions` / `objectStart` aid `deoptionalizeNeedle` in aligning offsets after
// optional-chain stripping.
// `absorbsRoot` boolean: set when the transform reused an outer's guardRef rather than
// installing its own guard. compose skips substitution of any inner contained within the
// root span (derived from `objectStart` + `rootRaw.length`) - inner's value is already
// threaded through the outer guard's `_ref = ...` slot. returns null when the outer
// didn't install a guard and didn't reuse one
export function createRewriteHint({ rootRaw, guardRef, deoptPositions, objectStart, absorbsRoot }) {
  if (!guardRef) return null;
  // `guardRef` without `rootRaw` breaks compose: substituteInner relies on rootRaw for
  // needle.startsWith checks. fail fast rather than silently produce a hint that
  // misroutes downstream composition
  if (!rootRaw) throw new Error('[core-js] createRewriteHint: guardRef requires rootRaw');
  return { rootRaw, guardRef, deoptPositions, objectStart, absorbsRoot: !!absorbsRoot };
}

// deferred transform queue for usage-pure: collects text replacements during traversal,
// composes nested transforms, applies after traversal
export default class TransformQueue {
  #code;
  #ms;
  // Set gives O(1) delete + insertion-order iteration (array had O(N) findIndex/splice)
  #transforms = new Set();
  // sorted snapshot + prefix max maintained incrementally for O(log n) containsRange
  #sorted = [];
  #prefixMaxEnd = [];
  // guardedRoot -> entries. linear scan per query, M typically ≤ 2-3 in practice
  #byGuardedRoot = new Map();
  // per-root widest `.end` - fast-reject for `hasGuardFor` when `query.end > max`.
  // not decremented on extract: an overstated cache falls through to the linear scan
  // (still correct), understated would drop valid matches
  #maxEndByGuardedRoot = new Map();
  // `start|end` -> entries (equal-range dups share a key) for O(1) extractContent lookup
  #byRange = new Map();
  // file id for invariant error messages - composition-bug reporters need to know which
  // file produced the failure (otherwise they have to bisect across thousands of fixtures)
  #fileId;

  constructor(code, ms, fileId = null) {
    this.#code = code;
    this.#ms = ms;
    this.#fileId = fileId;
  }

  // single-source-of-truth for invariant error messages - prepends the canonical
  // `[core-js] transform-queue: [<fileId>] ` prefix so call sites express only the
  // bug-specific tail, and reporters know which file produced the failure
  #invariant(message) {
    return new Error(`[core-js] transform-queue: ${ this.#fileId ? `[${ this.#fileId }] ` : '' }${ message }`);
  }

  add(start, end, content, guardedRoot, rewriteHint) {
    // MagicString.overwrite throws on zero-length ranges; inserts must use appendLeft/prependRight
    // instead. nothing in the plugin emits zero-length ranges today, so surface the mismatch
    // (and any `start > end`) as a caller bug immediately rather than corrupting silently.
    // out-of-bounds ranges are also caller bugs (offset arithmetic slipped past source bounds) -
    // catching them here pinpoints the bad callsite; MagicString would throw a less specific error.
    // non-integer offsets (NaN / undefined / string) silently pass the inequality checks because
    // numeric coercion + NaN comparisons are always false - reject them upfront
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new TypeError(`[core-js] transform-queue: start/end must be integers (received ${ String(start) }, ${ String(end) })`);
    }
    if (start >= end) throw new RangeError(`[core-js] transform-queue: invalid range [${ start },${ end })`);
    if (start < 0 || end > this.#code.length) {
      throw new RangeError(`[core-js] transform-queue: range [${ start },${ end }) out of bounds (source length ${ this.#code.length })`);
    }
    // content must be a string: undefined/null/object would silently corrupt via
    // MagicString.overwrite stringification. surface mismatch at caller, not mid-render
    if (typeof content !== 'string') {
      throw new TypeError(`[core-js] transform-queue: content must be a string (received ${ typeof content })`);
    }
    const entry = { start, end, content, guardedRoot, rewriteHint };
    this.#transforms.add(entry);
    pushOrInit(this.#byRange, rangeKey(start, end), entry);
    if (guardedRoot) {
      pushOrInit(this.#byGuardedRoot, guardedRoot, entry);
      const prevMax = this.#maxEndByGuardedRoot.get(guardedRoot);
      if (prevMax === undefined || end > prevMax) this.#maxEndByGuardedRoot.set(guardedRoot, end);
    }
    const pos = upperBound(this.#sorted, start);
    this.#sorted.splice(pos, 0, entry);
    updatePrefixMaxOnInsert(this.#sorted, this.#prefixMaxEnd, pos);
  }

  // strict containment only - equal range isn't "guarded" (both transforms must apply)
  hasGuardFor(start, end, root) {
    if (!root) return false;
    const maxEnd = this.#maxEndByGuardedRoot.get(root);
    if (maxEnd === undefined || maxEnd < end) return false;
    // extract drains #byGuardedRoot but not the maxEnd cache - defensive null-check
    const list = this.#byGuardedRoot.get(root);
    if (!list) return false;
    for (const t of list) {
      if (t.start <= start && t.end >= end && (t.start < start || t.end > end)) return true;
    }
    return false;
  }

  // guardRef of the outer that memoized `root` - lets nested polyfills reuse it.
  // pick the OUTERMOST guarded transform (largest range) for stability: insertion order
  // depends on visitor traversal which can drift between runs / parser variants. the
  // outermost transform's guardRef is the one whose memoization should dominate
  findOuterGuardRef(root) {
    if (!root) return null;
    const list = this.#byGuardedRoot.get(root);
    if (!list) return null;
    let best = null;
    for (const t of list) {
      if (!t.rewriteHint?.guardRef) continue;
      if (!best || (t.end - t.start) > (best.end - best.start)) best = t;
    }
    return best?.rewriteHint?.guardRef ?? null;
  }

  // O(log n) check if [start, end] is strictly contained within an already-queued transform
  containsRange(start, end) {
    return isStrictlyContained(this.#sorted, start, end, this.#prefixMaxEnd);
  }

  // O(log n) via indexed lookup + sorted binary search; was 3 × O(n) linear scans
  extractContent(start, end) {
    const rKey = rangeKey(start, end);
    const rList = this.#byRange.get(rKey);
    if (!rList?.length) return null;
    const entry = rList.shift();
    if (!rList.length) this.#byRange.delete(rKey);
    this.#transforms.delete(entry);
    if (entry.guardedRoot) {
      removeFrom(this.#byGuardedRoot, entry.guardedRoot, entry);
      // drop the maxEnd cache entry when the guarded root is fully drained - otherwise
      // `hasGuardFor` keeps consulting a stale upper bound and falls through to linear scan
      if (!this.#byGuardedRoot.has(entry.guardedRoot)) this.#maxEndByGuardedRoot.delete(entry.guardedRoot);
    }
    const sorted = this.#sorted;
    // binary search by start, then walk the equal-start run for entry identity
    let si = lowerBound(sorted, start);
    while (si < sorted.length && sorted[si].start === start && sorted[si] !== entry) si++;
    if (si < sorted.length && sorted[si] === entry) {
      sorted.splice(si, 1);
      updatePrefixMaxOnRemove(sorted, this.#prefixMaxEnd, si, entry.end);
    }
    return entry.content;
  }

  // compose nested transforms and apply to magic-string
  apply() {
    if (!this.#transforms.size) return;
    // single snapshot, sorted asc by start; fast path reverses in place, slow path re-sorts
    // in place. `#hasNesting` guarantees distinct starts on the fast-path branch so `reverse()`
    // produces a safe right-to-left application order without losing tie-break information
    const transforms = [...this.#transforms].sort((a, b) => a.start - b.start || b.end - a.end);
    this.#assertNoPartialOverlap(transforms);

    // fast path: no nesting - apply right-to-left
    if (!this.#hasNesting(transforms)) {
      transforms.reverse();
      for (const t of transforms) this.#ms.overwrite(t.start, t.end, t.content);
      return;
    }

    // slow path: compose nested transforms then apply outermost-first.
    // innermost first: smaller ranges before larger, right-to-left for same-level
    transforms.sort((a, b) => (a.end - a.start) - (b.end - b.start) || b.start - a.start);

    // phase 1: compose - #sorted is already maintained asc by start.
    // if an outer transform content ALREADY contains a formatted guard (e.g. from a prior
    // compose iteration on the same outer), the second pass below would detect the inner
    // needle inside the formatted string and replace again, producing a double-guard.
    // bounded by `rewriteHint` shape: guardRef-bearing hints mean the outer already
    // consumed its guard, and `substituteInner` rebuilds the guard-prefixed needle rather
    // than the bare root - no second fold applies
    const byStart = this.#sorted;
    const composedContent = new Map(); // transform -> composed content string
    const composed = [];

    for (const t of transforms) {
      const { start, end, rewriteHint } = t;
      let content = composedContent.get(t) ?? t.content;

      // binary search for inners within [start, end]
      const lo = lowerBound(byStart, start);
      const inners = [];
      const dups = [];
      for (let i = lo; i < byStart.length && byStart[i].start <= end; i++) {
        if (byStart[i] === t) continue;
        // 3+ wrappers at identical offsets: the old single-`dup` logic only merged the
        // last one and left the rest in `inners`, where substituteInner threw "could not
        // locate inner needle" after the polyfill had eliminated the original slice
        if (byStart[i].start === start && byStart[i].end === end) dups.push(byStart[i]);
        else if (byStart[i].end <= end) inners.push(byStart[i]);
      }
      const originalSlice = this.#code.slice(start, end);
      if (dups.length) {
        // another transform in the same equal-range cohort already owns the merge
        if (dups.some(d => composedContent.has(d))) continue;
        // fold all dups - `mergeEqualRange` nests wrappers and drops polyfills into the
        // innermost slot regardless of fold order
        for (const dup of dups) {
          content = mergeEqualRange(content, composedContent.get(dup) ?? dup.content, originalSlice, { start, end });
        }
      }
      // widest first so nested inners (where inner2 ⊂ inner1) are handled by inner1's
      // substitution before inner2 would be skipped. same-width ties: right-to-left
      inners.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.start - a.start);
      // track ranges of already-processed inners; used both for containment-skip and for
      // adjusting nth counts when multiple inners share the same needle
      const processedRanges = [];
      for (const inner of inners) {
        const innerContent = composedContent.get(inner) ?? inner.content;
        const needle = this.#code.slice(inner.start, inner.end);
        const innerOffset = inner.start - start;
        // outer reused an enclosing guard's ref rather than building its own (`absorbsRoot`).
        // inner's value is already threaded via the outer guard's memoize assignment; direct
        // substitution here would either leave stale `_ref` occurrences or re-inline the
        // inner (double-evaluate). any inner contained within the root span (derived from
        // `objectStart` + `rootRaw.length`) is skipped, including sub-transforms of the root
        // call (e.g. `Array.from` static MemberExpression inside `Array.from(x)`)
        if (rewriteHint?.absorbsRoot
          && rewriteHint.objectStart <= inner.start
          && inner.end <= rewriteHint.objectStart + rewriteHint.rootRaw.length) {
          processedRanges.push({ start: inner.start, end: inner.end });
          continue;
        }
        // needle position in originalSlice: count from start up to innerOffset, then subtract
        // same-needle occurrences already replaced by strictly-preceding processedRanges.
        // fixes `Array.from(x).reduce(Array.from)` - filter consumes the leftmost Array.from
        // during composition, so the rightmost inner's nth must point to the sole remaining slot.
        const nth = countOccurrences(originalSlice, needle, 0, innerOffset)
          - consumedOccurrencesBefore(originalSlice, needle, inner.start, start, processedRanges);
        const result = substituteInner(content, needle, innerContent, nth, rewriteHint);
        if (!result.found) {
          // inner was already swallowed by an enclosing inner we processed earlier
          if (processedRanges.some(r => r.start <= inner.start && r.end >= inner.end)) continue;
          throw this.#invariant('could not locate inner needle in outer content. '
            + `outer=[${ start },${ end }] inner=[${ inner.start },${ inner.end }]. `
            + 'this is a composition bug - please report with a reproducer.');
        }
        content = result.content;
        processedRanges.push({ start: inner.start, end: inner.end });
      }
      composedContent.set(t, content);
      composed.push(t);
    }

    // phase 2: apply outermost transforms only
    composed.sort((a, b) => a.start - b.start || b.end - a.end);
    let maxEnd = -1;
    for (const t of composed) {
      if (t.end > maxEnd) {
        this.#ms.overwrite(t.start, t.end, composedContent.get(t) ?? t.content);
        maxEnd = t.end;
      }
    }
  }

  // true on full containment or equal range (slow compose path handles both - equal-range
  // merge folds into the wrapper); false on no overlap (fast path, right-to-left apply)
  #hasNesting(sorted) {
    if (sorted.length < 2) return false;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].end <= sorted[i - 1].end) return true;
    }
    return false;
  }

  // partial overlap (`[10,20) intersect [15,25)`) would trip MagicString.overwrite with a
  // generic "already edited" error; surface ranges here for diagnostic. track running
  // max-end so non-consecutive shapes like `[0,10), [3,5), [7,14)` still flag the `[0,10)
  // vs [7,14)` partial overlap that consecutive-only iteration would miss
  #assertNoPartialOverlap(sorted) {
    if (sorted.length < 2) return;
    // walk all currently "open" intervals (those whose end > curr.start) so the diagnostic
    // names the actually-intersecting pair, not just the running-max bearer. on detection,
    // `find` returns the first open interval `o` such that `curr` starts strictly inside
    // `o` and extends strictly past it - true partial overlap. open list is bounded by
    // max-nesting depth in practice (filter rebuilds it per iteration, O(N·D) total)
    let open = [];
    for (const curr of sorted) {
      open = open.filter(o => o.end > curr.start);
      const conflict = open.find(o => curr.start > o.start && curr.end > o.end);
      if (conflict) {
        throw this.#invariant('partial overlap between transforms '
          + `[${ conflict.start },${ conflict.end }) and [${ curr.start },${ curr.end }). this is a `
          + 'composition bug - please report with a reproducer.');
      }
      open.push(curr);
    }
  }
}

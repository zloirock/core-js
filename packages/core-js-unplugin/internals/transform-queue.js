import { codePointEndingAt, IDENT_PART_RE, skipGap } from './text-scan.js';

// is [start, end] strictly contained within any range in the start-sorted array?
// (equal ranges are not considered contained - both transforms must be applied).
// binary search + prefix maxEnd resolves in O(log n); falls through to a linear scan only
// when the max end exactly equals query.end (strictness then reduces to r.start < query.start).
// split entries are owned through `splitInfo.logicalEnd` (prefix-only `.end` = mid stops
// short of the suffix tail) - prefixMaxEnd is built on logical ends, linear-scan check
// also queries via the helper
function isStrictlyContained({ ranges, start, end, prefixMaxEnd }) {
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
    if (entryLogicalEnd(r) >= end && r.start < start) return true;
  }
  return false;
}

// non-overlapping needle scan - polyfill needles embed syntactic delimiters (`.`, `(`,
// identifiers) that cannot self-overlap. empty needle is a caller bug - guard so
// indexOf('', ...) doesn't infinite-loop (pos never advances). identifier-boundary filter
// here keeps the position list aligned with `replaceNthOccurrence`'s match acceptance -
// without it, `countInRange` for needle `Array` would tally `_Array$from` substring matches
// that the replacer rejects, drifting `nth` and silently dropping legitimate substitutions
function collectOccurrencePositions(haystack, needle) {
  if (!needle.length) return [];
  const positions = [];
  for (let p = haystack.indexOf(needle); p !== -1; p = haystack.indexOf(needle, p + needle.length)) {
    if (hasIdentifierBoundary(haystack, p, needle)) positions.push(p);
  }
  return positions;
}

function lowerBoundNumber(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < target) lo = mid + 1; else hi = mid;
  }
  return lo;
}

// factory: per-haystack memoized lookup of `(needle) -> { positions, countInRange }`.
// the inner-substitution loop calls countInRange once per inner plus once per
// processedRange-per-inner pair; without memoization that yields O(N^2 L) for N inners
// over a slice of length L. caching positions arrays per unique needle reduces it to
// O(unique * L) precompute + O(N^2 log positions) range queries via binary search
function createNeedleScanner(haystack) {
  const cache = new Map();
  function positionsFor(needle) {
    let positions = cache.get(needle);
    if (!positions) {
      positions = collectOccurrencePositions(haystack, needle);
      cache.set(needle, positions);
    }
    return positions;
  }
  // count occurrences that fit entirely in [rangeStart, rangeEnd) - p satisfies
  // `p >= rangeStart AND p + needle.length <= rangeEnd`. binary search on the cached
  // positions array; degenerate ranges (negative span or shorter than needle) short-circuit
  function countInRange(needle, rangeStart, rangeEnd) {
    const len = needle.length;
    if (!len || rangeEnd - rangeStart < len) return 0;
    const positions = positionsFor(needle);
    const lo = lowerBoundNumber(positions, rangeStart);
    const hi = lowerBoundNumber(positions, rangeEnd - len + 1);
    return hi - lo;
  }
  return { countInRange };
}

// replace the `n`-th (0-based) occurrence of `needle` in `str`; return `str` unchanged if not found.
// negative `n` (possible if count math underflows - defensive) yields no replacement rather than
// a corrupt slice from `str.slice(0, -1) + replacement + ...` falling through the empty loop.
// empty needle: `indexOf('', 0)` returns 0 on any string, so without a guard we'd splice
// `replacement` in at position 0 repeatedly - silent corruption. bail early instead
// JS identifier-boundary check: when `needle` starts or ends with an identifier char, require
// the neighbour chars to be non-identifier (or absent at string boundaries), so the inner needle
// `Promise` doesn't match the SUBSTRING inside an already-substituted `_Promise` (that double-
// substitution would emit `__Promise` - an extra underscore, ReferenceError). `IDENT_PART_RE` is
// Unicode-aware (ID_Continue) so a non-ASCII letter suffix can't slip the boundary as standalone
function isIdentifierEdge(needle, edge) {
  if (!needle?.length) return false;
  return edge === 'start' ? IDENT_PART_RE.test(needle[0])
    : IDENT_PART_RE.test(needle.at(-1));
}

export function hasIdentifierBoundary(str, idx, needle) {
  // adjacent chars may be astral (surrogate-pair) identifier chars - test the WHOLE code point.
  // `codePointEndingAt` handles the char BEFORE the needle (trailing low surrogate); the built-in
  // `codePointAt` handles the char AFTER (leading high surrogate). a lone surrogate would test as
  // a boundary and mis-classify the needle as standalone
  if (isIdentifierEdge(needle, 'start') && idx > 0 && IDENT_PART_RE.test(codePointEndingAt(str, idx - 1))) return false;
  const tail = idx + needle.length;
  if (isIdentifierEdge(needle, 'end') && tail < str.length
    && IDENT_PART_RE.test(String.fromCodePoint(str.codePointAt(tail)))) return false;
  return true;
}

// the nth-occurrence index MUST come from the same enumeration the counter uses
// (`collectOccurrencePositions`: non-overlapping advance + boundary filter) - a private
// overlapping scan here would disagree with the counted `nth` on a self-bordered needle
// (`a.a` in `a.a.a`) and silently replace a different physical occurrence
export function replaceNthOccurrence({ str, needle, replacement, n }) {
  if (n < 0 || !needle.length) return str;
  const idx = collectOccurrencePositions(str, needle)[n];
  if (idx === undefined) return str;
  return str.slice(0, idx) + replacement + str.slice(idx + needle.length);
}

// `?.(` / `?.[` drop BOTH chars, `?.prop` keeps `.` - naive `replaceAll('?.', '.')`
// produces `.(` that never matches the `(` emitted by the inner transform.
// raw text transform - not AST-aware. `?.` inside a template literal (`` `a?.b` ``) or a
// regular string would also be rewritten. in practice the needle is always a slice of an
// AST MemberExpression / CallExpression range where strings can't appear in the optional
// position - the malformed-needle risk is bounded by the caller supplying correct ranges
export function deoptionalizeNeedle(needle) {
  return needle.replaceAll('?.', (_, offset) => {
    const next = needle[skipGap(needle, offset + 2)];
    return next === '(' || next === '[' ? '' : '.';
  });
}

// strip `?.` at SELECTED absolute positions only (the emitter's per-hop deopt). mirrors
// polyfill-emitter's `stripOptionalDots`: positions are absolute source offsets, `baseOffset`
// is the needle's source start. `?.(` / `?.[` drop both chars, `?.prop` keeps `.`. out-of-range
// positions are skipped, so an outer's full deopt list applied to a sub-slice needle only
// touches the markers that fall inside it - matching how an outer transform left some `?.`
// collapsed and others verbatim when it folded a partial receiver chain
export function deoptionalizeNeedleAtPositions(needle, baseOffset, positions) {
  if (!positions?.length) return needle;
  const sorted = [...positions].sort((a, b) => a - b);
  let result = '';
  let prev = 0;
  for (const absPos of sorted) {
    let rel = absPos - baseOffset;
    if (rel < 0 || rel >= needle.length) continue;
    rel = skipGap(needle, rel);
    if (rel >= needle.length || needle[rel] !== '?' || needle[rel + 1] !== '.') continue;
    result += needle.slice(prev, rel);
    const afterQ = skipGap(needle, rel + 2);
    prev = needle[afterQ] === '[' || needle[afterQ] === '(' ? rel + 2 : rel + 1;
  }
  return result + needle.slice(prev);
}

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

// does the outer hint carry a guardRef-backed root that this needle is rooted in?
// shared gate for both the prefix-rewrite path and the guardRef-tail candidate: outer
// memoized `rootRaw` as `guardRef`, and `needle` starts with `rootRaw` at a structural
// boundary (not a mid-identifier prefix match)
function needleRootedInGuard(needle, outerHint) {
  return !!outerHint?.rootRaw && !!outerHint.guardRef
    && needle.startsWith(outerHint.rootRaw) && hasRootBoundary(needle, outerHint.rootRaw.length);
}

// ordered needle shapes to try against `content`, MOST-SPECIFIC -> LEAST-SPECIFIC, first
// match wins. ordering is load-bearing: a guardRef shape ALSO matches as the raw needle
// (the `rootRaw` prefix exists verbatim inside `_ref = rootRaw`), so a less specific shape
// tried first would emit at the wrong slot. each entry below is appended only when its
// precondition holds, so the raw needle always sits at index 0
function buildNeedleCandidates({ needle, needleStart, outerHint }) {
  // [0] raw slice - matches when the outer neither deoptionalized nor guarded the chain
  const candidates = [needle];
  const hasOptionalChain = needle.includes('?.');
  // partial-deopt: the outer collapsed only SOME of the chain's `?.` (the hops it folded
  // into its receiver) and kept the rest verbatim. replay that exact per-position strip so
  // the inner needle matches the partially-collapsed text before the blanket full-deopt
  // below would over-strip the `?.` the outer left intact. needs the needle's source start
  // to map the outer's absolute `deoptPositions` onto this slice
  if (hasOptionalChain && needleStart !== undefined && outerHint?.deoptPositions?.length) {
    const partial = deoptionalizeNeedleAtPositions(needle, needleStart, outerHint.deoptPositions);
    if (partial !== needle) candidates.push(partial);
  }
  // full-deopt: matches when the outer's compose stripped every `?.` marker in the chain
  if (hasOptionalChain) candidates.push(deoptionalizeNeedle(needle));
  // guardRef + deopt-tail: outer memoized `rootRaw` as `guardRef`, so the inner needle's
  // root now reads `guardRef` and only the tail beyond `rootRaw` survives in the text
  if (needleRootedInGuard(needle, outerHint)) {
    candidates.push(outerHint.guardRef + deoptionalizeNeedle(needle.slice(outerHint.rootRaw.length)));
  }
  return candidates;
}

function substituteInner({ content, needle, needleStart, replacement, nth, outerHint, innerPrefix }) {
  // mirror babel-plugin's AST-mutation flow for `new (chain.method)(args)`: the outer
  // memoizes `chainRoot` (e.g. `arr.flat`) as `_ref`, then the inner visit replaces
  // `arr.flat` with `_flatMaybeArray(arr)` INSIDE the assignment. result: outer guard
  // becomes `_ref = _flatMaybeArray(arr)` and body uses `_ref()` (proper memoize, no
  // dead code). text-rewrite equivalent: when outer has guardRef + rootRaw AND the
  // inner is a split with a prefix (polyfill-helper invocation `_polyfill(receiver)`),
  // AND the inner needle extends BEYOND rootRaw (i.e. rootRaw is the inner's callee /
  // member-access prefix, not the full inner call), substitute the rootRaw inside the
  // guard's `_ref = rootRaw` slot with `innerPrefix`. needle.length === rootRaw.length
  // means rootRaw IS the full inner call (e.g. `this.at(0)?.includes` - rootRaw equals
  // inner) - in that case the existing guardRef-rewrite candidate (which substitutes the
  // full inner emit at `_ref` placeholder) is correct, so we fall through. try the prefix
  // path BEFORE the regular candidates - if we hit the body's `_ref()` first, the prefix
  // path is wasted (and we'd leave `_ref = rootRaw` dead code in the guard)
  if (innerPrefix && needleRootedInGuard(needle, outerHint) && needle.length > outerHint.rootRaw.length) {
    const rootRawResult = replaceNthOccurrence({ str: content, needle: outerHint.rootRaw, replacement: innerPrefix, n: 0 });
    if (rootRawResult !== content) return { content: rootRawResult, found: true, verbatim: false };
  }
  const candidates = buildNeedleCandidates({ needle, needleStart, outerHint });
  for (let i = 0; i < candidates.length; i++) {
    const result = replaceNthOccurrence({ str: content, needle: candidates[i], replacement, n: nth });
    // candidate[0] is the raw source slice: a hit there means the inner's source text sits
    // unmodified in `content`, so every transform nested inside this inner's source range
    // was replaced wholesale and its own needle is now gone. non-raw candidates (deopt /
    // guardRef shapes) rewrote the text, so a nested range may survive and still need its
    // own substitution - `verbatim` stays false for them so compose keeps scanning
    if (result !== content) return { content: result, found: true, verbatim: i === 0 };
  }
  return { content, found: false, verbatim: false };
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
function mergeEqualRange({ a, b, originalNeedle, range = null }) {
  // locate the needle through the boundary-aware `collectOccurrencePositions`, not raw indexOf /
  // includes: a raw substring scan can match the needle MID-IDENTIFIER (`Array` inside `ArrayBuffer`,
  // `at` inside `flat`), which would splice at a wrong offset or false-throw the single-occurrence
  // asserts on a substring hit. the helper applies the same JS identifier-boundary filter used to
  // resolve every other needle in the queue
  const aPositions = collectOccurrencePositions(a, originalNeedle);
  const bPositions = collectOccurrencePositions(b, originalNeedle);
  // contract: exactly one side (the "wrapper") contains the original source slice as a standalone
  // occurrence; the other (the "inner" polyfill) does not
  const [wrapper, inner, wrapperPositions, innerPositions] = aPositions.length
    ? [a, b, aPositions, bPositions]
    : [b, a, bPositions, aPositions];
  // `transform-queue: ` subsystem prefix matches the rest of the queue's diagnostics so users can
  // grep failures consistently. the `[core-js] [<fileId>] ` brand + file tag are owned by the
  // outer `tagError` (runTransform's catch), not self-prefixed here - matching the parse-error
  // throw-path convention and avoiding the double brand/id `tagError` would otherwise stamp
  const rangeStr = range ? ` at [${ range.start },${ range.end })` : '';
  // contract: at least one side wraps the original source. a regression that breaks this
  // invariant would silently drop the wrapper text and emit only the inner replacement.
  // production callers (synth-swap, arrow-body wrap) always preserve the needle in exactly
  // one slot - the throw makes a future callsite that drops both copies fail loudly
  if (!wrapperPositions.length) {
    throw new Error(`transform-queue: mergeEqualRange invariant${ rangeStr }: needle missing from both transforms (needle=${ JSON.stringify(originalNeedle) })`);
  }
  // assert single-occurrence invariant on BOTH sides:
  //   - wrapper-side: if a new outer-transform shape emits the needle twice, only the
  //     first slot would be swapped in silently; flag the regression loudly
  //   - inner-side: contract is "exactly one side wraps the original source". if inner
  //     also contains the needle, both sides are wrappers - picking `a` as wrapper is
  //     arbitrary and produces asymmetric output. fail loudly
  if (wrapperPositions.length > 1) {
    throw new Error(`transform-queue: mergeEqualRange invariant${ rangeStr }: wrapper contains needle >1 times (needle=${ JSON.stringify(originalNeedle) })`);
  }
  if (innerPositions.length) {
    throw new Error(`transform-queue: mergeEqualRange invariant${ rangeStr }: both sides contain needle - ambiguous wrapper (needle=${ JSON.stringify(originalNeedle) })`);
  }
  // hand-built slice-splice avoids `String.prototype.replace`'s `$&` / `$'` / `` $` `` /
  // `$n` interpretation if `inner` contains those tokens (user source with `$&` or polyfill
  // names with `$`). also one fewer scan of `wrapper` than a non-regex replace would cost
  const [first] = wrapperPositions;
  return wrapper.slice(0, first) + inner + wrapper.slice(first + originalNeedle.length);
}

// composite key for the (start, end) range index
function rangeKey(start, end) {
  return `${ start }|${ end }`;
}

// split entries store [start, mid) / [mid, end) physically but logically own [start, end).
// these helpers paper over the prefix/suffix duality so callers can treat split + non-split
// uniformly via logical-range queries
function entryLogicalEnd(entry) {
  return entry.splitInfo ? entry.splitInfo.logicalEnd : entry.end;
}

// a split suffix physically starts at `mid` but the pair logically begins at the prefix's
// start. selection/containment by logical range must use this so a suffix is never admitted
// without its prefix (which would orphan the pair when the prefix sits outside the range)
function entryLogicalStart(entry) {
  return entry.splitInfo?.role === 'suffix' ? entry.splitInfo.peer.start : entry.start;
}

function entryLogicalSpan(entry) {
  return entryLogicalEnd(entry) - entry.start;
}

function isSplit(entry) {
  return !!entry.splitInfo;
}

// is the entry's FULL logical range within [start, end]? split-aware on BOTH ends, so a
// split half qualifies only together with its peer - the single predicate every range-drain
// / range-membership site shares (a physical-start test would admit a suffix whose prefix
// lies outside the range and orphan it)
function entryLogicalWithin(entry, start, end) {
  return entryLogicalStart(entry) >= start && entryLogicalEnd(entry) <= end;
}

// for a split-pair entry, return the logical inner content (full prefix+suffix range).
// after the prefix's own outer iteration, composedContent.get(prefix) already holds the
// combined `prefix.content + suffix.content` (with any nested-inner substitutions baked
// in). suffix lookup proxies to peer's compose view. raw fallback only when neither half
// has been processed yet (rare - innermost-first iteration order processes leaves first)
function splitInnerContent(entry, composedContent) {
  const prefix = entry.splitInfo.role === 'prefix' ? entry : entry.splitInfo.peer;
  const suffix = entry.splitInfo.role === 'suffix' ? entry : entry.splitInfo.peer;
  return composedContent.get(prefix) ?? prefix.content + suffix.content;
}

// inner content + logical end + whether that content is already-composed (the inner's own
// nested inners folded in) rather than the raw fallback - hides the splitInfo branching from
// callers and derives all three in one place. `composed` gates the verbatim phantom-skip:
// only composed content safely absorbs the inners nested in it - a not-yet-composed equal-range
// split sibling (sorted after the current outer) still carries its un-substituted inners in
// the raw fallback. split-pair lookup keys on the prefix, matching `splitInnerContent`
function innerSubstitution(inner, composedContent) {
  if (inner.splitInfo) {
    const prefix = inner.splitInfo.role === 'prefix' ? inner : inner.splitInfo.peer;
    return { end: inner.splitInfo.logicalEnd, content: splitInnerContent(inner, composedContent), composed: composedContent.has(prefix) };
  }
  return { end: inner.end, content: composedContent.get(inner) ?? inner.content, composed: composedContent.has(inner) };
}

// does any range in `ranges` enclose [start, end] inclusively? the lists are short per-outer
// accumulators (processed / verbatim-absorbed ranges), so a linear scan is fine
function rangesEnclose(ranges, start, end) {
  return ranges.some(r => r.start <= start && r.end >= end);
}

// widest LOGICAL first so nested inners (where inner2 is contained in inner1) are handled by inner1's
// substitution before inner2 would be skipped. same-width ties: non-split before split
// (split entries are leaves; non-split equal-span entries are wrappers that semantically
// own the range, e.g. arrow-body wrap). then right-to-left for stable ordering
function sortInnersInnermostLast(inners) {
  function splitWeight(inner) {
    return inner.splitInfo ? 1 : 0;
  }

  inners.sort((a, b) => entryLogicalSpan(b) - entryLogicalSpan(a)
    || splitWeight(a) - splitWeight(b)
    || b.start - a.start);
}

// incremental prefix-max maintenance after splice. prefix max is monotonic non-decreasing:
// once the walk hits a stale slot that already covers the change, trailing slots stay correct.
// uses logical-end so split prefixes contribute their full [start, splitInfo.logicalEnd) span
function updatePrefixMaxOnInsert(sorted, prefixMaxEnd, pos) {
  const prev = pos > 0 ? prefixMaxEnd[pos - 1] : -1;
  const newEnd = entryLogicalEnd(sorted[pos]);
  prefixMaxEnd.splice(pos, 0, Math.max(newEnd, prev));
  if (newEnd > prev) for (let i = pos + 1; i < prefixMaxEnd.length; i++) {
    if (prefixMaxEnd[i] >= newEnd) return;
    prefixMaxEnd[i] = newEnd;
  }
}

function updatePrefixMaxOnRemove({ sorted, prefixMaxEnd, si, removedEnd }) {
  prefixMaxEnd.splice(si, 1);
  const prev = si > 0 ? prefixMaxEnd[si - 1] : -1;
  // removed end wasn't the contributor -> shifted-left stale values are already correct
  if (removedEnd <= prev) return;
  let running = prev;
  for (let i = si; i < sorted.length; i++) {
    const eEnd = entryLogicalEnd(sorted[i]);
    if (eEnd > running) running = eEnd;
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
  // no guard installed, but the emitter still stripped `?.` at hop boundaries (`deoptPositions`)
  // when collapsing a receiver chain. compose needs those positions so substituteInner can
  // rebuild the partially-deoptionalized needle an outer left behind. emit a deopt-only hint
  // (no rootRaw/guardRef checks downstream gate on `guardRef`, so this stays inert there)
  if (!guardRef) {
    return deoptPositions?.length ? { rootRaw: null, guardRef: null, deoptPositions, objectStart, absorbsRoot: false } : null;
  }
  // `guardRef` without `rootRaw` breaks compose: substituteInner relies on rootRaw for
  // needle.startsWith checks. fail fast rather than silently produce a hint that
  // misroutes downstream composition
  if (!rootRaw) throw new Error('createRewriteHint: guardRef requires rootRaw');
  return { rootRaw, guardRef, deoptPositions, objectStart, absorbsRoot: !!absorbsRoot };
}

// deferred transform queue for usage-pure: collects text replacements during traversal,
// composes nested transforms, applies after traversal
export default class TransformQueue {
  #code;
  #ms;
  // Set gives O(1) delete + insertion-order iteration (vs O(N) findIndex/splice on an array)
  #transforms = new Set();
  // sorted snapshot + prefix max maintained incrementally for O(log n) containsRange
  #sorted = [];
  #prefixMaxEnd = [];
  // guardedRoot -> entries. linear scan per query, M typically <= 2-3 in practice
  #byGuardedRoot = new Map();
  // per-root widest `.end` - fast-reject for `hasGuardFor` when `query.end > max`.
  // not decremented on extract: an overstated cache falls through to the linear scan
  // (still correct), understated would drop valid matches
  #maxEndByGuardedRoot = new Map();
  // `start|end` -> entries (equal-range dups share a key) for O(1) extractContent lookup
  #byRange = new Map();
  // pure point-inserts (zero-length, no composition). drained after overwrites in apply().
  // entry shape: { pos, content }. preserves insertion order via Set
  #inserts = new Set();

  constructor(code, ms) {
    this.#code = code;
    this.#ms = ms;
  }

  // single-source-of-truth for invariant error messages - prepends the `transform-queue: `
  // subsystem prefix so call sites express only the bug-specific tail. the `[core-js] [<fileId>] `
  // brand + file tag are added once by the outer `tagError` (runTransform's catch), NOT self-
  // prefixed here - matching the parse-error throw-path convention (`formatParseErrorForThrow`)
  // and avoiding the doubled brand/id `tagError` would otherwise stamp onto a self-branded message
  #invariant(message) {
    return new Error(`transform-queue: ${ message }`);
  }

  add(start, end, content, guardedRoot, rewriteHint, splitInfo = null) {
    // MagicString.overwrite throws on zero-length ranges; inserts must use appendLeft/prependRight
    // instead. nothing in the plugin emits zero-length ranges today, so surface the mismatch
    // (and any `start > end`) as a caller bug immediately rather than corrupting silently.
    // out-of-bounds ranges are also caller bugs (offset arithmetic slipped past source bounds) -
    // catching them here pinpoints the bad callsite; MagicString would throw a less specific error.
    // non-integer offsets (NaN / undefined / string) silently pass the inequality checks because
    // numeric coercion + NaN comparisons are always false - reject them upfront
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new TypeError(`transform-queue: start/end must be integers (received ${ String(start) }, ${ String(end) })`);
    }
    // split diagnostics so the caller sees which class of misuse fired:
    //   start === end -> caller meant insert (use `insert(pos, content)`);
    //   start > end   -> inverted range (caller's offset arithmetic is reversed)
    if (start === end) {
      throw new RangeError(`transform-queue: zero-length range [${ start },${ end }) - use insert() for insertions`);
    }
    if (start > end) {
      throw new RangeError(`transform-queue: inverted range [${ start },${ end }) - start must be < end`);
    }
    if (start < 0 || end > this.#code.length) {
      throw new RangeError(`transform-queue: range [${ start },${ end }) out of bounds (source length ${ this.#code.length })`);
    }
    // content must be a string: undefined/null/object would silently corrupt via
    // MagicString.overwrite stringification. surface mismatch at caller, not mid-render
    if (typeof content !== 'string') {
      throw new TypeError(`transform-queue: content must be a string (received ${ typeof content })`);
    }
    const entry = { start, end, content, guardedRoot, rewriteHint, splitInfo };
    this.#transforms.add(entry);
    pushOrInit(this.#byRange, rangeKey(start, end), entry);
    if (guardedRoot) {
      pushOrInit(this.#byGuardedRoot, guardedRoot, entry);
      const prevMax = this.#maxEndByGuardedRoot.get(guardedRoot);
      const logicalEnd = entryLogicalEnd(entry);
      if (prevMax === undefined || logicalEnd > prevMax) this.#maxEndByGuardedRoot.set(guardedRoot, logicalEnd);
    }
    const pos = upperBound(this.#sorted, start);
    this.#sorted.splice(pos, 0, entry);
    updatePrefixMaxOnInsert(this.#sorted, this.#prefixMaxEnd, pos);
    return entry;
  }

  // record a pure point-insert at `pos` (zero-length, no composition). use this for
  // boundary-anchored emissions like `var _ref;` at block start, parameter-default
  // backfill (`{ p } = {}` -> `{ p } = (...).p`), or catch-clause prelude. drained
  // after overwrites in `apply()` via `ms.appendRight`. multiple inserts at the same
  // pos preserve registration order. inserts MUST NOT land inside an overwrite range -
  // MagicString anchors to chunk identity, so insert content would survive into the
  // replaced output unpredictably (caller bug; not asserted here)
  insert(pos, content) {
    if (!Number.isInteger(pos)) {
      throw new TypeError(`transform-queue: insert pos must be an integer (received ${ String(pos) })`);
    }
    if (pos < 0 || pos > this.#code.length) {
      throw new RangeError(`transform-queue: insert pos ${ pos } out of bounds (source length ${ this.#code.length })`);
    }
    if (typeof content !== 'string') {
      throw new TypeError(`transform-queue: insert content must be a string (received ${ typeof content })`);
    }
    this.#inserts.add({ pos, content });
  }

  // emit a split instance-method rewrite as two adjacent transforms: prefix `[start, mid)`
  // covers receiver column, suffix `[mid, end)` covers method-tail column. MagicString
  // assigns distinct source positions to each chunk, fixing the "all output chars map to
  // receiver's source col" sourcemap collapse. compose layer treats the pair as ONE logical
  // inner via shared splitInfo metadata so outer transforms still substitute via single
  // [start, end] needle (not two halves)
  addSplit(start, mid, end, prefixContent, suffixContent, guardedRoot, rewriteHint) {
    // validate the FULL range up front - before the first `add` - so a bad range fails atomically.
    // integrality + in-bounds checks otherwise live inside `add`, which runs them per-call: an
    // out-of-bounds or non-integer `end` would pass the prefix `add(start, mid)` and only throw in
    // the suffix `add(mid, end)`, leaving an orphaned prefix entry that corrupts the next apply().
    // integer check first so NaN / non-integer offsets surface a clear cause (a non-integer mid also
    // slips the `start < mid < end` ordering check below via numeric coercion)
    if (!Number.isInteger(start) || !Number.isInteger(mid) || !Number.isInteger(end)) {
      throw new TypeError(`transform-queue: addSplit offsets must be integers (received [${ String(start) },${ String(mid) },${ String(end) }))`);
    }
    // up-front invariant: zero-length halves throw with cryptic [X,X) error inside
    // the second `add` call without indicating which side is bad. callers (polyfill-emitter
    // split-eligible branch) already gate on this; diagnostic exists for future call sites
    if (!(start < mid && mid < end)) {
      throw new RangeError(`transform-queue: addSplit invariant violated, expected start < mid < end (received [${ start },${ mid },${ end }))`);
    }
    // bounds: start < mid < end already orders the offsets, so checking the outer pair covers both
    // halves ([start, mid) and [mid, end) sit within [start, end))
    if (start < 0 || end > this.#code.length) {
      throw new RangeError(`transform-queue: addSplit range [${ start },${ end }) out of bounds (source length ${ this.#code.length })`);
    }
    // validate BOTH content args upfront - throwing inside the second `add` call after
    // the first succeeded would leave an orphan prefix entry in the queue. typeof check
    // mirrors `add`'s implicit string requirement (RawTransformContent template); also
    // reject empty strings - a split represents one logical rewrite emitted as two halves,
    // each must carry non-empty replacement text. empty halves indicate caller bug
    // (would emit zero-length chunk at sourcemap-distinct position)
    if (typeof prefixContent !== 'string' || typeof suffixContent !== 'string'
        || prefixContent.length === 0 || suffixContent.length === 0) {
      throw new TypeError(`transform-queue: addSplit content args must be non-empty strings; received prefix=${ typeof prefixContent === 'string' ? `'${ prefixContent }'` : typeof prefixContent }, suffix=${ typeof suffixContent === 'string' ? `'${ suffixContent }'` : typeof suffixContent }`);
    }
    const groupId = Symbol('split');
    const prefixEntry = this.add(start, mid, prefixContent, guardedRoot, rewriteHint,
      { groupId, role: 'prefix', logicalEnd: end });
    // suffix carries the same groupId + the prefix entry reference for compose-time
    // logical-inner assembly. no guardedRoot/hint - composition queries land on prefix.
    // WARNING: prefix.splitInfo.peer <-> suffix.splitInfo.peer form a cyclic reference -
    // `JSON.stringify(entry)` on either side throws on the cycle. transforms are not
    // serialized in the current pipeline (no JSON.stringify call sites against entries),
    // so the cycle is benign here; if a future debug / snapshot pathway needs serialization
    // it must walk via `groupId` lookup instead of dereferencing `.peer`
    const suffixEntry = this.add(mid, end, suffixContent, null, null,
      { groupId, role: 'suffix', logicalEnd: end, peer: prefixEntry });
    prefixEntry.splitInfo.peer = suffixEntry;
    return prefixEntry;
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
      const tEnd = entryLogicalEnd(t);
      if (t.start <= start && tEnd >= end && (t.start < start || tEnd > end)) return true;
    }
    return false;
  }

  // guardRef of the outer that memoized `root` - lets nested polyfills reuse it.
  // pick the OUTERMOST guarded transform (largest span) for stability: insertion order
  // depends on visitor traversal which can drift between runs / parser variants. the
  // outermost transform's guardRef is the one whose memoization should dominate. uses
  // `entryLogicalSpan` so split-entry prefixes (physical end = mid, logicalEnd = end)
  // contribute their FULL [start, logicalEnd) span - currently call sites pass `null`
  // guardedRoot for split entries so this is latent, but the API allows split entries
  // here and physical span would understate their reach
  findOuterGuardRef(root) {
    if (!root) return null;
    const list = this.#byGuardedRoot.get(root);
    if (!list) return null;
    let best = null;
    let bestSpan = -1;
    for (const t of list) {
      if (!t.rewriteHint?.guardRef) continue;
      const span = entryLogicalSpan(t);
      if (span > bestSpan) {
        best = t;
        bestSpan = span;
      }
    }
    return best?.rewriteHint?.guardRef ?? null;
  }

  // O(log n) check if [start, end] is strictly contained within an already-queued transform
  containsRange(start, end) {
    return isStrictlyContained({ ranges: this.#sorted, start, end, prefixMaxEnd: this.#prefixMaxEnd });
  }

  // true when any already-queued transform sits fully within [start, end]. used before
  // appending a raw source tail to a synthetic body, so a nested transform inside that tail
  // is not duplicated (the tail would carry both the raw text and the composed rewrite)
  hasTransformWithin(start, end) {
    for (const entry of this.#transforms) {
      if (entryLogicalWithin(entry, start, end)) return true;
    }
    return false;
  }

  // extract the LOGICAL transform covering [start, end] and return its full content, dropping
  // every physical piece. O(log n) via indexed lookup + sorted binary search.
  // a split pair is keyed in #byRange by its PHYSICAL halves (start|mid, mid|end), never its
  // logical start|end - so a #byRange hit on a split half means the caller passed a half-range,
  // which has no logical owner: the half-content alone is meaningless and emitting it would
  // desync the still-queued peer. accept ONLY a non-split whole-range entry from the bucket;
  // otherwise fall through to logical assembly (which returns the assembled pair for the logical
  // range, or null for a half-range so the caller bakes the raw slice instead)
  extractContent(start, end) {
    const rList = this.#byRange.get(rangeKey(start, end));
    const whole = rList?.find(entry => !isSplit(entry));
    if (whole) {
      this.#dropEntryAndPeer(whole);
      return whole.content;
    }
    // no whole-range entry: assemble the split pair whose two physical halves logically span
    // [start, end] (extracting either half alone would orphan the peer), and drop both
    const prefix = this.#splitPrefixByLogicalRange(start, end);
    if (!prefix) return null;
    const content = prefix.content + prefix.splitInfo.peer.content;
    this.#dropEntryAndPeer(prefix);
    return content;
  }

  // the split prefix half starting at `start` whose two physical halves logically span [start, end],
  // or null. split halves live in `#sorted` by physical start; the prefix carries `splitInfo.logicalEnd`
  #splitPrefixByLogicalRange(start, end) {
    const sorted = this.#sorted;
    for (let i = lowerBound(sorted, start); i < sorted.length && sorted[i].start === start; i++) {
      const e = sorted[i];
      if (e.splitInfo?.role === 'prefix' && e.splitInfo.logicalEnd === end) return e;
    }
    return null;
  }

  // remove an entry and, when it is one half of a split pair, its peer - extracting either half
  // alone would leave the other an orphan covering only part of the logical range
  #dropEntryAndPeer(entry) {
    this.#removeEntry(entry);
    if (entry.splitInfo?.peer) this.#removeEntry(entry.splitInfo.peer);
  }

  // drain every point-insert whose pos falls within [start, end] and return them as
  // zero-length splices ({ start: pos, end: pos, content }). the destructure flatten calls
  // this when it relocates an SE-prefix whose inner inserts (catch-clause prelude emitted
  // during a sibling visit, etc.) were queued at their original positions: left in the queue
  // they'd land inside the flatten's own overwrite range and trip the insert-inside-overwrite
  // invariant (MagicString can't fold an appendRight into an overwritten chunk). overwrites
  // inside the range still compose normally; only inserts need relocating. the caller bakes
  // the returned splices into the lifted text via its own spliceInRange
  drainInsertsInRange(start, end) {
    const splices = [];
    for (const ins of this.#inserts) {
      if (ins.pos >= start && ins.pos <= end) {
        splices.push({ start: ins.pos, end: ins.pos, content: ins.content });
        this.#inserts.delete(ins);
      }
    }
    return splices;
  }

  // compose every overwrite/split entry fully contained in [start, end] using the SAME nesting +
  // equal-range-dup folding apply() performs, then return the OUTERMOST composed transforms as
  // non-overlapping splices ({ start, end, content }) and drain ALL consumed entries. counterpart
  // to `drainInsertsInRange` for the case where an outer rewrite replaces [start, end] with text
  // NOT derived from the original source (e.g. a catch param overwritten to bare `_ref`): inner
  // polyfill transforms can't compose via `#substituteInners` (their needle is absent from the
  // replacement) and would orphan, so the caller bakes the returned splices into the relocated
  // text via its own `spliceInRange`. composing FIRST is essential: a flat drain of nested entries
  // (e.g. `[9].flat().at(0)` - inner `.flat` inside outer `.at`) would have spliceInRange overlay
  // the inner over its enclosing outer and corrupt output; folding inners into their outer here
  // yields disjoint outermost splices spliceInRange can apply safely
  composeAndDrainRange(start, end) {
    const inRange = [];
    for (const entry of this.#transforms) {
      if (entryLogicalWithin(entry, start, end)) inRange.push(entry);
    }
    if (!inRange.length) return [];
    // run the SAME sort+partial-overlap guard apply() does (otherwise reached only via
    // #applyOverwrites). this drain path bakes the returned splices into relocated text via the
    // caller's spliceInRange, which - unlike compose - cannot detect a partial overlap and would
    // silently corrupt the output (and the entries are drained, so the final apply() never sees
    // them). the sort is for the guard; #composeEntries re-sorts inRange by logical span below
    this.#sortAndAssertNoPartialOverlap(inRange);
    const { composed, composedContent } = this.#composeEntries(inRange);
    const splices = this.#outermostComposed(composed, composedContent);
    // peer-aware drain: logical-within membership already admits split halves only in pairs,
    // and #dropEntryAndPeer is idempotent on an already-removed entry, so dropping via the peer
    // path leaves no orphaned half even if a future caller hands an unpaired half
    for (const entry of inRange) this.#dropEntryAndPeer(entry);
    return splices;
  }

  #removeEntry(entry) {
    this.#transforms.delete(entry);
    const rKey = rangeKey(entry.start, entry.end);
    const rList = this.#byRange.get(rKey);
    if (rList) {
      const idx = rList.indexOf(entry);
      if (idx !== -1) rList.splice(idx, 1);
      if (!rList.length) this.#byRange.delete(rKey);
    }
    if (entry.guardedRoot) {
      removeFrom(this.#byGuardedRoot, entry.guardedRoot, entry);
      // drop the maxEnd cache entry when the guarded root is fully drained - otherwise
      // `hasGuardFor` keeps consulting a stale upper bound and falls through to linear scan
      if (!this.#byGuardedRoot.has(entry.guardedRoot)) this.#maxEndByGuardedRoot.delete(entry.guardedRoot);
    }
    const sorted = this.#sorted;
    // binary search by start, then walk the equal-start run for entry identity
    let si = lowerBound(sorted, entry.start);
    while (si < sorted.length && sorted[si].start === entry.start && sorted[si] !== entry) si++;
    if (si < sorted.length && sorted[si] === entry) {
      sorted.splice(si, 1);
      updatePrefixMaxOnRemove({ sorted, prefixMaxEnd: this.#prefixMaxEnd, si, removedEnd: entryLogicalEnd(entry) });
    }
  }

  // compose nested transforms and apply to magic-string. inserts MUST drain AFTER overwrites:
  // `appendRight(pos)` cached against a chunk that a later `overwrite(pos, end, ...)` replaces
  // is silently dropped (MagicString folds the insert into the overwritten chunk's pre-edit
  // intro, which `overwrite` discards). running inserts last means each `appendRight(pos)`
  // lands on the post-overwrite chunk's intro - preserved regardless of `pos`/overwrite
  // collision. reproducer: minified `function f(){arr.at?.(0).map(x=>x)}` - the polyfill
  // overwrites at the byte right after `{` AND scope-tracker inserts `var _ref, _ref2, _ref3;`
  // at that same byte; without inserts-last the var decl is lost, yielding ReferenceError in strict mode
  apply() {
    // defensive invariant: inserts MUST NOT land strictly inside any overwrite range -
    // MagicString anchors `appendRight` to chunk identity; an insert pos that falls inside
    // a chunk later replaced by `overwrite` is folded into the discarded pre-edit intro
    // and silently lost (caller bug; manifests as missing-output without a thrown error).
    // assert at the gate so the source of the bug is the insert call, not a vague absent-
    // var-decl symptom downstream. `pos === start` and `pos === end` are legitimate boundary
    // anchors (insert immediately before/after an overwrite chunk) - only strictly-inside is
    // the violation
    if (this.#inserts.size && this.#transforms.size) this.#assertNoInsertInsideOverwrite();
    this.#applyOverwrites();
    for (const { pos, content } of this.#inserts) this.#ms.appendRight(pos, content);
  }

  // binary-searching for just the largest-start range with start <= pos misses ENCLOSING
  // ranges with smaller starts (outer [0,10) containing inner [5,7) - search for pos=8
  // returns [5,7) and passes). reuse the already-maintained `#sorted` + `#prefixMaxEnd`
  // (incrementally updated by add/remove) instead of re-sorting per apply. `entryLogicalEnd`
  // is the correct upper bound: split prefix physically ends at mid but its logicalEnd
  // covers the full [start, end] that apply() composes/overwrites as a single chunk
  // the overwrite entry strictly enclosing `pos` (start < pos < logicalEnd), or null. binary
  // search by start + the prefix-max gate short-circuits the common no-overlap case before the
  // linear back-scan. shared by the insert-inside-overwrite invariant and the scoped-var
  // compose gate
  #enclosingOverwrite(pos) {
    const sorted = this.#sorted;
    const prefMax = this.#prefixMaxEnd;
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sorted[mid].start <= pos) lo = mid + 1; else hi = mid;
    }
    if (lo === 0 || prefMax[lo - 1] <= pos) return null;
    for (let i = lo - 1; i >= 0; i--) {
      if (pos > sorted[i].start && pos < entryLogicalEnd(sorted[i])) return sorted[i];
    }
    return null;
  }

  // true when a point-insert at `pos` would land strictly inside an overwrite (the condition
  // apply() rejects). scope-tracker consults this to re-emit a scoped `var` as a composing
  // body-overwrite instead of a doomed raw insert
  insertLandsInsideOverwrite(pos) {
    return this.#enclosingOverwrite(pos) !== null;
  }

  #assertNoInsertInsideOverwrite() {
    for (const { pos } of this.#inserts) {
      const entry = this.#enclosingOverwrite(pos);
      if (entry) {
        throw new RangeError(`transform-queue: insert at ${ pos } lands inside overwrite [${ entry.start },${ entryLogicalEnd(entry) })`);
      }
    }
  }

  #applyOverwrites() {
    if (!this.#transforms.size) return;
    // single snapshot, sorted asc by start (+ overlap-checked); fast path reverses in place, slow
    // path re-sorts in place. `#hasNesting` guarantees distinct starts on the fast-path branch so
    // `reverse()` produces a safe right-to-left application order without losing tie-break information
    const transforms = [...this.#transforms];
    this.#sortAndAssertNoPartialOverlap(transforms);

    // fast path: no nesting - apply right-to-left
    if (!this.#hasNesting(transforms)) {
      transforms.reverse();
      for (const t of transforms) this.#ms.overwrite(t.start, t.end, t.content);
      return;
    }

    this.#applyComposed(transforms);
  }

  // slow path: compose nested transforms then apply outermost-first.
  // innermost first: smaller LOGICAL ranges before larger, right-to-left for same-level.
  // split prefix's physical end = mid (small) but it logically owns full [start, logicalEnd]
  // - sort by logical span so split's outer-iteration runs AFTER inners contained in its
  // logical range, matching the wrap order non-split entries naturally produce
  #applyComposed(transforms) {
    const { composed, composedContent } = this.#composeEntries(transforms);
    // phase 2: overwrite outermost transforms only (split prefix owns its full logical range;
    // its suffix peer was excluded from `composed` via the role==='suffix' skip in phase 1)
    for (const { start, end, content } of this.#outermostComposed(composed, composedContent)) {
      this.#ms.overwrite(start, end, content);
    }
  }

  // phase 1 of composition: fold each transform's inners + equal-range dups into its content.
  // returns the OUTER transforms (dups that ceded their merge to a sibling are dropped) plus a
  // transform -> composed-content map. shared by `#applyComposed` (overwrites outermost onto the
  // magic-string) and `composeAndDrainRange` (returns outermost as splices for relocated text).
  // sorts ascending by LOGICAL span so inners compose before the outer that contains them.
  // note on double-guard: if an outer's content ALREADY holds a formatted guard from a prior
  // compose pass, a second fold could re-detect the inner needle - bounded by `rewriteHint` shape
  // (guardRef-bearing hints rebuild the guard-prefixed needle rather than the bare root)
  #composeEntries(transforms) {
    transforms.sort((a, b) => entryLogicalSpan(a) - entryLogicalSpan(b) || b.start - a.start);
    const byStart = this.#sorted;
    const composedContent = new Map(); // transform -> composed content string
    const composed = [];
    for (const t of transforms) {
      // suffix-half of a split pair: composed via prefix (`composedContent` will hold the
      // logical inner against the prefix entry). skip outer-iteration here since suffix's
      // [mid, end) range never independently nests other transforms (it's source bytes
      // owned by prefix's logical [start, end])
      if (t.splitInfo?.role === 'suffix') continue;
      const result = this.#composeOne(t, byStart, composedContent);
      if (result === null) continue;  // dup already merged by sibling
      composedContent.set(t, result);
      composed.push(t);
    }
    return { composed, composedContent };
  }

  // phase 2 of composition: from the `composed` set keep only the OUTERMOST transforms (drop any
  // whose logical range is swallowed by an earlier-starting wider sibling) as ordered, disjoint
  // { start, end, content } splices. shared by `#applyComposed` (overwrites each onto the
  // magic-string) and `composeAndDrainRange` (bakes them into relocated text). a split prefix
  // overwrites its FULL logical range; its suffix peer was already excluded in phase 1
  #outermostComposed(composed, composedContent) {
    // tiebreak by LOGICAL end - the swallow check below compares logical spans, and a split
    // prefix's physical end understates its range: sorting it after a same-start non-split
    // sibling would emit BOTH splices (overlapping) instead of swallowing the narrower one
    composed.sort((a, b) => a.start - b.start || entryLogicalEnd(b) - entryLogicalEnd(a));
    const splices = [];
    let maxEnd = -1;
    for (const t of composed) {
      const tEnd = entryLogicalEnd(t);
      if (tEnd > maxEnd) {
        splices.push({ start: t.start, end: tEnd, content: composedContent.get(t) ?? t.content });
        maxEnd = tEnd;
      }
    }
    return splices;
  }

  // compose a single transform `t` with its inners + dups. returns the composed content
  // string, or null when a sibling dup already owns the merge (caller skips this iteration).
  #composeOne(t, byStart, composedContent) {
    const { start, splitInfo } = t;
    const logicalEnd = entryLogicalEnd(t);
    // initial content for prefix-half = prefix.content + suffix.content (suffix's text
    // gets baked into composed content; suffix entry is excluded from `composed` array
    // via the role==='suffix' continue at the compose loop's top)
    let content = composedContent.get(t)
      ?? (splitInfo?.role === 'prefix' ? t.content + splitInfo.peer.content : t.content);
    const { inners, dups } = this.#scanInners(t, byStart, logicalEnd);
    const originalSlice = this.#code.slice(start, logicalEnd);
    if (dups.length) {
      if (dups.some(d => composedContent.has(d))) return null;  // sibling owns merge
      // fold all dups - `mergeEqualRange` nests wrappers and drops polyfills into the
      // innermost slot regardless of fold order
      for (const dup of dups) {
        const dupContent = isSplit(dup)
          ? splitInnerContent(dup, composedContent)
          : composedContent.get(dup) ?? dup.content;
        content = mergeEqualRange({
          a: content, b: dupContent, originalNeedle: originalSlice,
          range: { start, end: logicalEnd },
        });
      }
    }
    sortInnersInnermostLast(inners);
    return this.#substituteInners({ content, inners, originalSlice, start, logicalEnd, rewriteHint: t.rewriteHint, composedContent });
  }

  // collect inner / dup transforms within `[t.start, logicalEnd]` from `byStart`. split
  // pairs deduplicated via groupId so logical inner appears once. when iter t is itself
  // a split, non-split cands at logical-equal range are inners (split is leaf in compose
  // tree, no equal-range dup partnership). non-split t with non-split cand at exact same
  // range is a real dup (multiple wrappers at the same offsets)
  #scanInners(t, byStart, logicalEnd) {
    const { start, splitInfo } = t;
    const lo = lowerBound(byStart, start);
    const inners = [];
    const dups = [];
    const seenSplitGroups = new Set();
    if (splitInfo) seenSplitGroups.add(splitInfo.groupId);
    for (let i = lo; i < byStart.length && byStart[i].start <= logicalEnd; i++) {
      const cand = byStart[i];
      if (cand === t) continue;
      const candEnd = entryLogicalEnd(cand);
      if (cand.splitInfo) {
        if (seenSplitGroups.has(cand.splitInfo.groupId)) continue;
        seenSplitGroups.add(cand.splitInfo.groupId);
        if (candEnd <= logicalEnd) inners.push(cand);
        continue;
      }
      if (cand.end > logicalEnd || cand.start < start) continue;
      const exactRangeMatch = cand.start === start && cand.end === logicalEnd;
      // split outers can never be dup partners with anyone (split is leaf - it pretends
      // to span the logical range only for inner-substitution purposes; non-split same-
      // range entries are wrappers above the split, not equal-range dup partners)
      if (exactRangeMatch && !splitInfo) dups.push(cand);
      else if (!exactRangeMatch) inners.push(cand);
    }
    return { inners, dups };
  }

  // apply substituteInner per inner, tracking processedRanges for nth adjustment and
  // for skipping inners already swallowed by a wider sibling. throws on locate failure.
  // `createNeedleScanner` memoizes per-needle position arrays for the originalSlice so
  // the loop runs in O(N L_unique + N^2 log L) instead of O(N^2 L) for N inners.
  // `verbatimAbsorbing` short-circuits the dominant cost on deeply-nested receiver chains
  // (`a.flat().flat()...`): once a wider inner matches via its raw source slice, every
  // narrower inner nested in its source range is a phantom and is skipped before the
  // per-candidate `content` scans - without it those scans make compose cubic in chain depth
  #substituteInners({ content, inners, originalSlice, start, logicalEnd, rewriteHint, composedContent }) {
    const processedRanges = [];
    const verbatimAbsorbing = [];
    const { countInRange } = createNeedleScanner(originalSlice);
    for (const inner of inners) {
      const { end: innerEndLogical, content: innerContent, composed: innerComposed } = innerSubstitution(inner, composedContent);
      const innerRange = { start: inner.start, end: innerEndLogical };
      // outer reused an enclosing guard's ref rather than building its own (`absorbsRoot`).
      // inner's value is already threaded via the outer guard's memoize assignment; direct
      // substitution here would either leave stale `_ref` occurrences or re-inline the
      // inner (double-evaluate). any inner contained within the root span (derived from
      // `objectStart` + `rootRaw.length`) is skipped, including sub-transforms of the root
      // call (e.g. `Array.from` static MemberExpression inside `Array.from(x)`)
      if (rewriteHint?.absorbsRoot
        && rewriteHint.objectStart <= inner.start
        && innerEndLogical <= rewriteHint.objectStart + rewriteHint.rootRaw.length) {
        processedRanges.push(innerRange);
        continue;
      }
      // phantom fast-path: a wider inner already substituted via its raw source slice, and
      // this inner's source range nests inside it - its needle was replaced wholesale and is
      // gone from `content`. skip before the per-candidate scans below, which would each scan
      // `content` only to fail and reach the same conclusion at the loop's tail. gated on RAW
      // matches only (`verbatimAbsorbing`): deopt / guardRef substitutions rewrote the text,
      // so a nested range can survive there and must stay on the slow path. widest-first order
      // puts the enclosing range first, so the common nested-chain hit resolves in O(1)
      if (rangesEnclose(verbatimAbsorbing, inner.start, innerEndLogical)) continue;
      const needle = this.#code.slice(inner.start, innerEndLogical);
      // split inners expose their prefix-half text (the polyfill-helper invocation
      // `_polyfill(receiver)` emitted by addInstanceTransform). compose hands this to
      // substituteInner so the rootRaw-alone substitution path can swap in just the
      // helper call (matching babel's mutated-AST shape) instead of the full inner
      const innerPrefix = inner.splitInfo?.role === 'prefix' ? inner.content
        : inner.splitInfo?.role === 'suffix' ? inner.splitInfo.peer.content
        : null;
      // needle position in originalSlice: count from start up to innerOffset, then subtract
      // same-needle occurrences already replaced by strictly-preceding processedRanges.
      // fixes `Array.from(x).reduce(Array.from)` - filter consumes the leftmost Array.from
      // during composition, so the rightmost inner's nth must point to the sole remaining slot
      let nth = countInRange(needle, 0, inner.start - start);
      for (const r of processedRanges) {
        if (r.end <= inner.start) nth -= countInRange(needle, r.start - start, r.end - start);
      }
      let result = substituteInner({
        content, needle, needleStart: inner.start, replacement: innerContent, nth, outerHint: rewriteHint, innerPrefix,
      });
      // raw-slice hit at the original nth, on an inner whose replacement is its already-
      // composed text: the inner's source was present verbatim and got replaced wholesale by
      // content that already folded the inner's OWN nested inners, so this range now absorbs
      // any inner nested in it. all three gates matter: non-raw / recovered hits may land on
      // a slot that doesn't line up with the source range, and a not-yet-composed inner
      // (equal-range split sibling sorted later) still carries its un-substituted inners in
      // the raw fallback - absorbing then would drop those nested substitutions. captured
      // before the recovery loop below reassigns `result`
      const cleanRawMatch = result.found && result.verbatim && innerComposed;
      // inner already swallowed by an enclosing inner processed earlier: its slot is gone from
      // content. skip the phantom HERE, before the recovery loop below - otherwise that loop
      // decrements nth and re-targets a still-pending sibling's identical needle (sibling
      // conditional / logical branches sharing the same polyfilled sub-expression), corrupting
      // that sibling's slot and crashing a later locate. only the first substituteInner failing
      // reaches this - a legit re-substitution finds its own slot, so chained-polyfill /
      // equal-range-dup / split-pair are unaffected. recovery now only handles the strip case
      if (!result.found && rangesEnclose(processedRanges, inner.start, innerEndLogical)) continue;
      // rebuild-outer recovery: source-position nth assumes outer's content preserves every
      // source needle match. multi-decl flatten REWRITES earlier declarators (`{X:{m}}=globalThis`
      // -> `const m = _polyfill`), stripping some source-level needle matches from content
      // entirely. when source-nth overshoots the surviving matches in content, decrement and
      // retry - each strip-only-before-inner case reduces the effective ordinal by one.
      // bounded by `nth` (worst case scans down to 0); first successful nth wins so a hit at
      // nth-1 is the correct slot when outer dropped one preceding match
      if (!result.found && nth > 0) {
        for (let tryNth = nth - 1; tryNth >= 0 && !result.found; tryNth--) {
          result = substituteInner({
            content, needle, needleStart: inner.start, replacement: innerContent, nth: tryNth, outerHint: rewriteHint, innerPrefix,
          });
        }
      }
      if (!result.found) {
        // identifier-boundary rejection: scan ALL occurrences of needle in content. if a
        // STANDALONE one exists (identifier boundary on both sides), the inner SHOULD have
        // matched it - nth count is off, this is a real bug. if all occurrences sit inside
        // larger identifier tokens (e.g. needle `Map` finds only `_MapPrime`-style substring),
        // outer already substituted at every reachable position and inner's transform is a
        // phantom (its effect is already encoded by outer). skip phantoms silently
        let hasStandaloneMatch = false;
        let hasAnyMatch = false;
        for (let idx = content.indexOf(needle); idx !== -1; idx = content.indexOf(needle, idx + 1)) {
          hasAnyMatch = true;
          if (hasIdentifierBoundary(content, idx, needle)) {
            hasStandaloneMatch = true;
            break;
          }
        }
        if (hasAnyMatch && !hasStandaloneMatch) {
          processedRanges.push(innerRange);
          continue;
        }
        throw this.#invariant('could not locate inner needle in outer content. '
          + `outer=[${ start },${ logicalEnd }] inner=[${ inner.start },${ innerEndLogical }] `
          + `needle=${ JSON.stringify(needle) }. `
          + 'this is a composition bug - please report with a reproducer.');
      }
      content = result.content;
      // record verbatim raw matches so deeper nested inners short-circuit at the fast-path
      // above. entries stay mutually disjoint: a nested inner that would fall inside one is
      // skipped before it can substitute, so it never reaches here to be recorded
      if (cleanRawMatch) verbatimAbsorbing.push(innerRange);
      // drop any already-processed ranges enclosed by this new range. without pruning,
      // a later inner whose nth subtraction loops over processedRanges would count needles
      // in the enclosed-range positions TWICE - once via the enclosed inner's own range,
      // once via this enclosing range. processed ranges must stay non-overlapping for
      // `countInRange` accumulation across `r.end <= inner.start` filter to be correct
      for (let i = processedRanges.length - 1; i >= 0; i--) {
        const r = processedRanges[i];
        if (r.start >= innerRange.start && r.end <= innerRange.end) processedRanges.splice(i, 1);
      }
      processedRanges.push(innerRange);
    }
    return content;
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

  // sort `entries` by start (widest-end first on ties) IN PLACE, then run the partial-overlap
  // guard. both the apply() path (#applyOverwrites) and the relocated-text drain path
  // (composeAndDrainRange) must surface a partial overlap before composing/applying, and
  // #assertNoPartialOverlap requires start-sorted input - so the sort+assert pair lives here once.
  // callers reuse the now-sorted array (apply for its fast-path reverse; drain hands it to compose)
  #sortAndAssertNoPartialOverlap(entries) {
    entries.sort((a, b) => a.start - b.start || b.end - a.end);
    this.#assertNoPartialOverlap(entries);
  }

  // partial overlap (`[10,20) intersect [15,25)`) would trip MagicString.overwrite with a
  // generic "already edited" error; surface ranges here for diagnostic. track running
  // max-end so non-consecutive shapes like `[0,10), [3,5), [7,14)` still flag the `[0,10)
  // vs [7,14)` partial overlap that consecutive-only iteration would miss.
  // split entries own [start, logicalEnd) logically even though physical halves stop at the
  // mid - represent each split pair by its prefix only (suffix carries no new logical info),
  // and use `entryLogicalEnd` so an inner contained within the full logical span doesn't trip
  // a false partial-overlap when it crosses the physical mid
  #assertNoPartialOverlap(sorted) {
    if (sorted.length < 2) return;
    let open = [];
    for (const curr of sorted) {
      // suffix half adds no new logical info beyond its prefix peer - skip the walk for it.
      // any inner that genuinely partial-overlaps the split's logical span has already been
      // surfaced against the prefix
      if (curr.splitInfo?.role === 'suffix') continue;
      const currEnd = entryLogicalEnd(curr);
      open = open.filter(o => entryLogicalEnd(o) > curr.start);
      const conflict = open.find(o => curr.start > o.start && currEnd > entryLogicalEnd(o));
      if (conflict) {
        throw this.#invariant('partial overlap between transforms '
          + `[${ conflict.start },${ entryLogicalEnd(conflict) }) and [${ curr.start },${ currEnd }). this is a `
          + 'composition bug - please report with a reproducer.');
      }
      open.push(curr);
    }
  }
}

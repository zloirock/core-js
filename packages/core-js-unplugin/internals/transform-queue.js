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

// non-overlapping occurrences of `needle` in `haystack[rangeStart, rangeEnd)`
function countOccurrences(haystack, needle, rangeStart = 0, rangeEnd = haystack.length) {
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

// replace the `n`-th (0-based) occurrence of `needle` in `str`; return `str` unchanged if not found
function replaceNthOccurrence(str, needle, replacement, n) {
  let idx = -1;
  for (let i = 0; i <= n; i++) {
    idx = str.indexOf(needle, idx + 1);
    if (idx === -1) return str;
  }
  return str.slice(0, idx) + replacement + str.slice(idx + needle.length);
}

// try needle shapes: raw slice -> deoptionalized (`?.` -> `.`) -> guardRef-rewritten
// (`rootRaw -> guardRef + deopt`) for nested polyfills sharing a chain root
function substituteInner(content, needle, replacement, nth, outerHint) {
  const candidates = [needle];
  if (needle.includes('?.')) candidates.push(needle.replaceAll('?.', '.'));
  if (outerHint?.rootRaw && outerHint.guardRef && needle.startsWith(outerHint.rootRaw)) {
    candidates.push(outerHint.guardRef + needle.slice(outerHint.rootRaw.length).replaceAll('?.', '.'));
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

// equal-range merge: arrow body wrapper + inner polyfill share the same [start, end].
// the "wrapper" contains the original source as substring; the "inner" doesn't
function mergeEqualRange(a, b, originalNeedle) {
  const aIsWrapper = a.includes(originalNeedle);
  const wrapper = aIsWrapper ? a : b;
  const inner = aIsWrapper ? b : a;
  return wrapper.includes(originalNeedle) ? wrapper.replace(originalNeedle, inner) : inner;
}

// deferred transform queue for usage-pure: collects text replacements during traversal,
// composes nested transforms, applies after traversal
export default class TransformQueue {
  #code;
  #ms;
  #transforms = [];
  // incrementally maintained sorted snapshot + prefix max for O(log n) containsRange
  #sorted = [];
  #prefixMaxEnd = [];
  // index: guardedRoot node -> transforms that guard it (O(1) hasGuardFor / findOuterGuardRef)
  #byGuardedRoot = new Map();

  constructor(code, ms) {
    this.#code = code;
    this.#ms = ms;
  }

  add(start, end, content, guardedRoot, rewriteHint) {
    const entry = { start, end, content, guardedRoot, rewriteHint };
    this.#transforms.push(entry);
    if (guardedRoot) {
      const list = this.#byGuardedRoot.get(guardedRoot);
      if (list) list.push(entry);
      else this.#byGuardedRoot.set(guardedRoot, [entry]);
    }
    // maintain sorted snapshot incrementally so containsRange stays O(log n)
    const pos = lowerBound(this.#sorted, start);
    this.#sorted.splice(pos, 0, entry);
    // update prefix max from insertion point onward
    const prev = pos > 0 ? this.#prefixMaxEnd[pos - 1] : -1;
    let running = prev;
    for (let i = pos; i < this.#sorted.length; i++) {
      if (this.#sorted[i].end > running) running = this.#sorted[i].end;
      this.#prefixMaxEnd[i] = running;
    }
  }

  // check if a containing transform already guards the given root identifier
  hasGuardFor(start, end, root) {
    if (!root) return false;
    const list = this.#byGuardedRoot.get(root);
    if (!list) return false;
    for (const t of list) {
      if (t.start <= start && t.end >= end && (t.start < start || t.end > end)) return true;
    }
    return false;
  }

  // guardRef of the outer that memoized `root` - lets nested polyfills reuse it
  findOuterGuardRef(root) {
    if (!root) return null;
    const list = this.#byGuardedRoot.get(root);
    if (!list) return null;
    for (const t of list) if (t.rewriteHint?.guardRef) return t.rewriteHint.guardRef;
    return null;
  }

  // O(log n) check if [start, end] is strictly contained within an already-queued transform
  containsRange(start, end) {
    return isStrictlyContained(this.#sorted, start, end, this.#prefixMaxEnd);
  }

  // remove a queued transform by exact range and return its content, or null if not found
  extractContent(start, end) {
    const idx = this.#transforms.findIndex(t => t.start === start && t.end === end);
    if (idx === -1) return null;
    const entry = this.#transforms[idx];
    this.#transforms.splice(idx, 1);
    if (entry.guardedRoot) {
      const list = this.#byGuardedRoot.get(entry.guardedRoot);
      const li = list?.indexOf(entry) ?? -1;
      if (li !== -1) {
        if (list.length === 1) this.#byGuardedRoot.delete(entry.guardedRoot);
        else list.splice(li, 1);
      }
    }
    const si = this.#sorted.indexOf(entry);
    if (si !== -1) {
      this.#sorted.splice(si, 1);
      // rebuild prefix max from removal point
      this.#prefixMaxEnd.length = this.#sorted.length;
      let running = si > 0 ? this.#prefixMaxEnd[si - 1] : -1;
      for (let i = si; i < this.#sorted.length; i++) {
        if (this.#sorted[i].end > running) running = this.#sorted[i].end;
        this.#prefixMaxEnd[i] = running;
      }
    }
    return entry.content;
  }

  // compose nested transforms and apply to magic-string
  apply() {
    const { length } = this.#transforms;
    if (!length) return;

    // fast path: no nesting - skip composition, apply right-to-left
    if (!this.#hasNesting()) {
      this.#transforms.sort((a, b) => b.start - a.start);
      for (const t of this.#transforms) this.#ms.overwrite(t.start, t.end, t.content);
      return;
    }

    // slow path: compose nested transforms then apply outermost-first
    // sort innermost first: smaller ranges before larger, right-to-left for same-level
    this.#transforms.sort((a, b) => (a.end - a.start) - (b.end - b.start) || b.start - a.start);

    // phase 1: compose - build byStart index once, track composed content via Map
    const byStart = [...this.#transforms].sort((a, b) => a.start - b.start);
    const composedContent = new Map(); // transform -> composed content string
    const composed = [];

    for (const t of this.#transforms) {
      const { start, end, rewriteHint } = t;
      let content = composedContent.get(t) ?? t.content;

      // binary search for inners within [start, end]
      const lo = lowerBound(byStart, start);
      const inners = [];
      let dup = null;
      for (let i = lo; i < byStart.length && byStart[i].start <= end; i++) {
        if (byStart[i] === t) continue;
        if (byStart[i].end <= end) inners.push(byStart[i]);
        // equal-range dedup: arrow body wrapper shares range with its inner polyfill
        if (byStart[i].start === start && byStart[i].end === end) dup = byStart[i];
      }
      if (dup) {
        if (composedContent.has(dup)) continue;
        content = mergeEqualRange(content, composedContent.get(dup) ?? dup.content, this.#code.slice(start, end));
        const di = inners.indexOf(dup);
        if (di !== -1) inners.splice(di, 1);
      }
      // widest first so nested inners (where inner2 ⊂ inner1) are handled by inner1's
      // substitution before inner2 would be skipped. same-width ties: right-to-left
      inners.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.start - a.start);

      const originalSlice = this.#code.slice(start, end);
      // track ranges of already-processed inners; used both for containment-skip and for
      // adjusting nth counts when multiple inners share the same needle
      const processedRanges = [];
      for (const inner of inners) {
        const innerContent = composedContent.get(inner) ?? inner.content;
        const needle = this.#code.slice(inner.start, inner.end);
        const innerOffset = inner.start - start;
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
          throw new Error('[core-js] transform-queue: could not locate inner needle in outer content. '
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

  // detect if any transform range is fully contained within another
  #hasNesting() {
    if (this.#transforms.length < 2) return false;
    const sorted = [...this.#transforms].sort((a, b) => a.start - b.start || b.end - a.end);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].end <= sorted[i - 1].end) return true;
    }
    return false;
  }
}

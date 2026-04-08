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

// insert into sorted array maintaining start-ascending order
function insertSorted(ranges, t) {
  let lo = 0;
  let hi = ranges.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ranges[mid].start < t.start) lo = mid + 1;
    else hi = mid;
  }
  ranges.splice(lo, 0, t);
}

// count how many times `needle` appears in `haystack` before `targetOffset`
function occurrencesBeforeOffset(haystack, needle, targetOffset) {
  let count = 0;
  for (let pos = haystack.indexOf(needle); pos !== -1 && pos < targetOffset;
    pos = haystack.indexOf(needle, pos + 1)) count++;
  return count;
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

// deferred transform queue for usage-pure: collects text replacements during traversal,
// composes nested transforms, applies after traversal
export default class TransformQueue {
  #code;
  #ms;
  #transforms = [];
  #sorted = null; // lazily built sorted snapshot for containsRange
  #prefixMaxEnd = null; // running max of sorted[i].end, enables O(log n) containment check

  constructor(code, ms) {
    this.#code = code;
    this.#ms = ms;
  }

  add(start, end, content, guardedRoot, rewriteHint) {
    this.#transforms.push({ start, end, content, guardedRoot, rewriteHint });
    this.#sorted = null; // invalidate
    this.#prefixMaxEnd = null;
  }

  // check if a containing transform already guards the given root identifier
  hasGuardFor(start, end, root) {
    if (!root) return false;
    return this.#transforms.some(t => t.guardedRoot === root
      && t.start <= start && t.end >= end && (t.start < start || t.end > end));
  }

  // guardRef of the outer that memoized `root` - lets nested polyfills reuse it
  findOuterGuardRef(root) {
    if (!root) return null;
    const match = this.#transforms.find(t => t.guardedRoot === root && t.rewriteHint?.guardRef);
    return match?.rewriteHint?.guardRef ?? null;
  }

  // check if [start, end] is strictly contained within an already-queued transform
  containsRange(start, end) {
    if (!this.#sorted) {
      this.#sorted = [...this.#transforms].sort((a, b) => a.start - b.start);
      this.#prefixMaxEnd = new Array(this.#sorted.length);
      let running = -1;
      for (let i = 0; i < this.#sorted.length; i++) {
        if (this.#sorted[i].end > running) running = this.#sorted[i].end;
        this.#prefixMaxEnd[i] = running;
      }
    }
    return isStrictlyContained(this.#sorted, start, end, this.#prefixMaxEnd);
  }

  // remove a queued transform by exact range and return its content, or null if not found
  extractContent(start, end) {
    const idx = this.#transforms.findIndex(t => t.start === start && t.end === end);
    if (idx === -1) return null;
    const { content } = this.#transforms[idx];
    this.#transforms.splice(idx, 1);
    this.#sorted = null;
    return content;
  }

  // compose nested transforms and apply to magic-string
  apply() {
    const { length } = this.#transforms;
    if (!length) return;

    // fast path: no nesting - skip O(n²) composition, apply right-to-left
    if (!this.#hasNesting()) {
      this.#transforms.sort((a, b) => b.start - a.start);
      for (const t of this.#transforms) this.#ms.overwrite(t.start, t.end, t.content);
      return;
    }

    // slow path: compose nested transforms then apply outermost-first
    // sort innermost first: smaller ranges before larger, right-to-left for same-level
    this.#transforms.sort((a, b) => (a.end - a.start) - (b.end - b.start) || b.start - a.start);

    // phase 1: compose - substitute inner transforms' content into outer transforms
    // byStart index enables O(log n + k) inner lookup instead of O(n) linear scan
    const composed = [];
    const byStart = [];
    for (const { start, end, content: raw, rewriteHint } of this.#transforms) {
      let content = raw;

      // binary search for first candidate with start >= current start
      let lo = 0;
      let hi = byStart.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (byStart[mid].start < start) lo = mid + 1;
        else hi = mid;
      }
      // collect inners within [start, end], sort largest first for correct composition order
      const inners = [];
      for (let i = lo; i < byStart.length && byStart[i].start <= end; i++) {
        if (byStart[i].end <= end) inners.push(byStart[i]);
      }
      inners.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.start - a.start);

      // inners sorted largest-first — a smaller inner covered by an already-substituted
      // larger inner is expected to miss (it's embedded in the larger's composed content).
      // a miss on a non-covered inner means the outer still holds raw source: throw loudly
      const originalSlice = this.#code.slice(start, end);
      const coveredRanges = [];
      for (const inner of inners) {
        const needle = this.#code.slice(inner.start, inner.end);
        const nth = occurrencesBeforeOffset(originalSlice, needle, inner.start - start);
        const result = substituteInner(content, needle, inner.content, nth, rewriteHint);
        if (!result.found) {
          const covered = coveredRanges.some(r => r.start <= inner.start && r.end >= inner.end);
          if (!covered) {
            throw new Error('[core-js] transform-queue: could not locate inner needle in outer content. '
              + `outer=[${ start },${ end }] inner=[${ inner.start },${ inner.end }]. `
              + 'this is a composition bug — please report with a reproducer.');
          }
          continue;
        }
        content = result.content;
        coveredRanges.push(inner);
      }

      // equal-range dedup: update in place instead of duplicating (e.g. arrow body wrapper
      // sharing range with its inner polyfill). current `content` is the composed version
      const dup = inners.find(inner => inner.start === start && inner.end === end);
      if (dup) {
        dup.content = content;
      } else {
        const entry = { start, end, content };
        composed.push(entry);
        insertSorted(byStart, entry);
      }
    }

    // phase 2: apply outermost transforms only
    // sort by start ascending, end descending; sweep tracking maxEnd to skip contained ranges
    composed.sort((a, b) => a.start - b.start || b.end - a.end);
    let maxEnd = -1;
    for (const t of composed) {
      if (t.end > maxEnd) {
        this.#ms.overwrite(t.start, t.end, t.content);
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

// binary search: is [start, end] strictly contained within any range in the sorted array?
// (equal ranges are not considered contained - both transforms must be applied)
function isStrictlyContained(ranges, start, end) {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = ranges[mid];
    if (r.start <= start && r.end >= end && (r.start < start || r.end > end)) return true;
    if (r.start > start) hi = mid - 1;
    else lo = mid + 1;
  }
  if (lo > 0) {
    const r = ranges[lo - 1];
    return r.start <= start && r.end >= end && (r.start < start || r.end > end);
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

// deferred transform queue for usage-pure mode
// collects text replacements during traversal, composes nested transforms, applies after traversal
export default class TransformQueue {
  #code;
  #ms;
  #transforms = [];

  constructor(code, ms) {
    this.#code = code;
    this.#ms = ms;
  }

  add(start, end, content) {
    this.#transforms.push({ start, end, content });
  }

  // check if [start, end] is strictly contained within an already-queued transform
  containsRange(start, end) {
    return this.#transforms.some(t => t.start <= start && t.end >= end && (t.start !== start || t.end !== end));
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

    const composed = [];
    for (const { start, end, content: raw } of this.#transforms) {
      let content = raw;
      // collect inner transforms sorted: largest first (middle transforms already contain
      // their own inners' substitutions), same size right-to-left (preserves occurrence indices)
      const inners = [];
      for (let i = composed.length - 1; i >= 0; i--) {
        const inner = composed[i];
        if (inner.start >= start && inner.end <= end) inners.push(inner);
      }
      inners.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.start - a.start);

      // substitute each inner's composed content at the correct occurrence
      // (position-aware, not replaceAll — preserves string literals with matching text)
      const originalSlice = this.#code.slice(start, end);
      for (const inner of inners) {
        const needle = this.#code.slice(inner.start, inner.end);
        const nth = occurrencesBeforeOffset(originalSlice, needle, inner.start - start);
        content = replaceNthOccurrence(content, needle, inner.content, nth);
      }
      composed.push({ start, end, content });
    }

    // apply outermost first: sort by descending range size, then descending start
    composed.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.start - a.start);

    // skip transforms contained within already-applied wider ranges
    const applied = []; // sorted by start ascending
    for (const t of composed) {
      if (isStrictlyContained(applied, t.start, t.end)) continue;
      this.#ms.overwrite(t.start, t.end, t.content);
      insertSorted(applied, t);
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

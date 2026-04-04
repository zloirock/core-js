// binary search: is [start, end] contained within any range in the sorted array?
function isContained(ranges, start, end) {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = ranges[mid];
    if (r.start <= start && r.end >= end) return true;
    if (r.start > start) hi = mid - 1;
    else lo = mid + 1;
  }
  // check neighbor - binary search by start may miss a range that starts before
  return lo > 0 && ranges[lo - 1].start <= start && ranges[lo - 1].end >= end;
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
      // iterate in reverse (largest inner transforms first) so that a containing
      // middle transform is substituted before its own children
      for (let i = composed.length - 1; i >= 0; i--) {
        const inner = composed[i];
        if (inner.start >= start && inner.end <= end) {
          content = content.replaceAll(this.#code.slice(inner.start, inner.end), inner.content);
        }
      }
      composed.push({ start, end, content });
    }

    // apply outermost first: sort by descending range size, then descending start
    composed.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.start - a.start);

    // skip transforms contained within already-applied wider ranges
    const applied = []; // sorted by start ascending
    for (const t of composed) {
      if (isContained(applied, t.start, t.end)) continue;
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

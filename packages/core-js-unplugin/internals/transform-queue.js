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

  // compose nested transforms and apply to magic-string
  apply() {
    if (!this.#transforms.length) return;

    // sort innermost first: smaller ranges before larger, right-to-left for same-level
    this.#transforms.sort((a, b) => (a.end - a.start) - (b.end - b.start) || b.start - a.start);

    // when an outer transform's content references original source that has an inner transform,
    // substitute the inner transform's replacement into the outer
    const composed = [];

    for (const { start, end, content: raw } of this.#transforms) {
      let content = raw;
      for (const inner of composed) {
        if (inner.start >= start && inner.end <= end) {
          content = content.replaceAll(this.#code.slice(inner.start, inner.end), inner.content);
        }
      }
      composed.push({ start, end, content });
    }

    // apply from right to left (largest start first) to preserve positions
    composed.sort((a, b) => b.start - a.start);

    const applied = [];
    for (const t of composed) {
      // skip if contained within an already-applied wider range
      if (applied.some(a => a.start <= t.start && a.end >= t.end)) continue;
      try {
        this.#ms.overwrite(t.start, t.end, t.content);
        applied.push(t);
      } catch { /* skip conflicting */ }
    }
  }
}

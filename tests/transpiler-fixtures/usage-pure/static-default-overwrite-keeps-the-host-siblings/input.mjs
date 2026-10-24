// A static's defaulted leaf extracts as an overwrite that replaces the whole assignment, so it takes
// the host only where the leaf stands there alone. A sibling at the outer level - an unknown computed
// key, an opted-out hop - keeps its own write in the residual beside the extraction.
let from, value, of, groupBy;
({ Array: { from = fallback }, [key]: value } = globalThis);
({
  Array: { of = fallback },
  // core-js-disable-next-line
  Map: { groupBy },
} = globalThis);

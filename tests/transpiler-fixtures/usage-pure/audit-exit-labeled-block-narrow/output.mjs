import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `if (typeof x === 'number') outer: { return null; }` - the if's consequent is a
// LabeledStatement wrapping a BlockStatement that always exits. nodeAlwaysExits must peel
// the LabeledStatement (the label is a no-op wrapper for break/continue targeting) and
// inspect the inner body's exit semantics. without the peel, the labeled body's `return`
// is invisible at the if-level, narrow drops, and `.at()` falls back to generic
function probe(x: number | string) {
  if (typeof x === 'number') outer: {
    return null;
  }
  return _atMaybeString(x).call(x, 0);
}
probe('hello');
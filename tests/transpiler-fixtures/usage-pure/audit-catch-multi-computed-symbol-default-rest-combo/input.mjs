// catch param destructure mixing two computed Symbol keys (only one synth-swappable)
// + AssignmentPattern default on the synth-swap key + rest gather. plugin orchestrates
// hoisted `_ref2`, an `it` extractor with default fallback, and a residual destructure
// for `Symbol.asyncIterator` + `...rest` - all in one CatchClause
try {} catch ({ [Symbol.iterator]: it = altIter, [Symbol.asyncIterator]: ait, ...rest }) {
  it();
  ait;
  rest;
}

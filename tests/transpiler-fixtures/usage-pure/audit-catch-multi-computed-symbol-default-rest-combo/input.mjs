// catch param destructure mixing two computed Symbol keys (only one rewritable) + a
// default-value on the rewritable key + rest gather. The plugin orchestrates a hoisted
// `_ref2`, an `it` extractor with default fallback, and a residual destructure for
// `Symbol.asyncIterator` + `...rest` - all in one catch clause
try {} catch ({ [Symbol.iterator]: it = altIter, [Symbol.asyncIterator]: ait, ...rest }) {
  it();
  ait;
  rest;
}

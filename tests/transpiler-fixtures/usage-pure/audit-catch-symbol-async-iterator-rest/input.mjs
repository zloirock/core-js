// catch param destructuring with computed Symbol.asyncIterator key plus rest. unlike
// `Symbol.iterator` (synth-swapped to `_getIteratorMethod` extractor), async-iterator has
// no synth-swap path - the computed key is replaced by the polyfill binding, the rest
// gather is preserved verbatim, and no `it = _get*(_ref)` line is hoisted
try {} catch ({ [Symbol.asyncIterator]: ait, ...rest }) {
  ait;
  rest;
}

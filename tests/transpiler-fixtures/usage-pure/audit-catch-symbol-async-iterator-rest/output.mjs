import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// catch param destructuring with computed Symbol.asyncIterator key plus rest. unlike
// `Symbol.iterator` (synth-swapped to `_getIteratorMethod` extractor), async-iterator has
// no synth-swap path - the computed key is replaced by the polyfill binding, the rest
// gather is preserved verbatim, and no `it = _get*(_ref)` line is hoisted
try {} catch (_ref) {
  let {
    [_Symbol$asyncIterator]: ait,
    ...rest
  } = _ref;
  ait;
  rest;
}
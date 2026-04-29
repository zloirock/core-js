// catch param destructuring with a computed Symbol.asyncIterator key plus rest. Unlike
// `Symbol.iterator` (rewritten via a `_getIteratorMethod` extractor), async-iterator
// has no extractor rewrite path - the computed key is replaced by the polyfill binding,
// the rest gather is preserved verbatim, and no extractor line is hoisted
try {} catch ({ [Symbol.asyncIterator]: ait, ...rest }) {
  ait;
  rest;
}

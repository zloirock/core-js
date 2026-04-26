import _Array$from from "@core-js/pure/actual/array/from";
// destructure with default value is rewritten verbatim - the polyfilled `from` flows
// into the standard `=== void 0 ? null : value` desugar. The default branch is dead
// code at runtime since the polyfill is always defined, but the shape is preserved.
const from = _Array$from === void 0 ? null : _Array$from;
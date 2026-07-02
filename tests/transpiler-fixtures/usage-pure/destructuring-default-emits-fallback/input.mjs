// destructure with default value is rewritten verbatim - the polyfilled `from` flows
// into the standard `=== void 0 ? null : value` desugar. The default branch is dead
// code at runtime since the polyfill is always defined, but the shape is preserved.
const { from = null } = Array;

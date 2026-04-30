// many polyfillable props in a single pattern. asserts the destructure rewrite path
// scales sublinear / linear with prop count and produces valid output for moderate-size
// patterns. covers the per-prop emission + receiver retention for multi-prop patterns
const { from, of, isArray, fromAsync } = Array;
export { from, of, isArray, fromAsync };

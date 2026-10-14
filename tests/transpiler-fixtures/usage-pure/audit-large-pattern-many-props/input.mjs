// several polyfillable statics beside a native one in a single pattern: each claim extracts as a
// declaration of its own, and the native key keeps the receiver in a residual pattern.
const { from, of, isArray, fromAsync } = Array;
export { from, of, isArray, fromAsync };

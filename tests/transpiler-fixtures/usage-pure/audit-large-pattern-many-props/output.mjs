import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
// several polyfillable statics beside a native one in a single pattern: each claim extracts as a
// declaration of its own, and the native key keeps the receiver in a residual pattern.
const from = _Array$from;
const of = _Array$of;
const fromAsync = _Array$fromAsync;
const {
  isArray
} = Array;
export { from, of, isArray, fromAsync };
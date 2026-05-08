import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
const of = _Array$of;
const fromAsync = _Array$fromAsync;
// many polyfillable props in a single pattern. asserts the destructure rewrite path
// scales sublinear / linear with prop count and produces valid output for moderate-size
// patterns. covers the per-prop emission + receiver retention for multi-prop patterns
const {
  isArray
} = Array;
export { from, of, isArray, fromAsync };
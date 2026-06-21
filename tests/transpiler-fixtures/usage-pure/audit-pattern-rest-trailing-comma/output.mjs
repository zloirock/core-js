import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
// trailing comma after last property (before rest if any) - parser accepts it as
// non-rest. the property-removal slicing must handle the trailing comma without leaving
// double commas in the rebuilt pattern
const of = _Array$of;
export { from, of };
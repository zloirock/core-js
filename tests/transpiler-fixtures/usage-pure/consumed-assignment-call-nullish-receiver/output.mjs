import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A call observing the assignment result still follows the source nullish check.
let from, of;
export const value = consume((_ref = {} = _globalThis.window?.Array, from = _Array$from, of = _Array$of, _ref));
export { from, of };
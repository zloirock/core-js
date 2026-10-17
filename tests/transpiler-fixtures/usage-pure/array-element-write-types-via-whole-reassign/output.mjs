import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a dominating whole-binding reassign IS the value source - precision comes from the new init
let replaced = [[1], [2]];
replaced = [[9]];
export const viaWholeReassign = _atMaybeArray(_ref = replaced[0]).call(_ref, 8);
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// An argument known to be undefined activates the written function's default.
const box = {};
box.fn = (value = [8, 9]) => value;
const empty = undefined;
use(_atMaybeArray(_ref = box.fn(empty)).call(_ref, -1));
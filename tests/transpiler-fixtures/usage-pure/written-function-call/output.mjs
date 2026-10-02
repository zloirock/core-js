import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A function written into an initially missing slot returns an array.
// Infer the call result separately from the function value.
const box = {};
box.fn = () => [8, 9];
use(_atMaybeArray(_ref = box.fn()).call(_ref, -1));
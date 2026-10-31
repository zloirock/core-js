import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A written toString slot can return an array; inherited-call narrowing must not apply.
const box = {};
box.toString = () => [8, 9];
use(_at(_ref = box.toString()).call(_ref, -1));
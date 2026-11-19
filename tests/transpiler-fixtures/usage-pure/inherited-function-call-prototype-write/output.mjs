import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A prototype replacement invalidates the inherited intrinsic call proof.
Object.prototype.toString = () => [8, 9];
const box = {};
use(_at(_ref = box.toString()).call(_ref, -1));
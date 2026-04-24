import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
const _ref = getArr();
const at = (_ref2 = _at(_ref)) === void 0 ? alt : _ref2;
// destructure from a call init with one default-valued instance property plus another
// instance property: the call must be evaluated once (memoized), and the default must
// fire only when the polyfill lookup returns undefined
const includes = _includes(_ref);
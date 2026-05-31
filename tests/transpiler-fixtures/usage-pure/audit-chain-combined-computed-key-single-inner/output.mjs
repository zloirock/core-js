import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// computed-key outer call on a single-optional inner (`a.flat?.()["includes"](2)`): the inner
// result must keep its receiver, emitted as `_ref.call(a)` not `_ref()`. bailing the computed-key
// outer to the standalone path used to drop the receiver here (a runtime throw); the combine binds it
null == (_ref = _flatMaybeArray(a)) ? void 0 : _includes(_ref2 = _ref.call(a)).call(_ref2, 2);
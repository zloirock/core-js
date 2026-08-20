import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// `recv.m?.()` on a non-polyfilled method: the optional call guards the method, but the call
// must still run with `this === recv`. memoizing the callee and invoking `_ref()` would lose
// the receiver - emit `_ref.call(recv)` so the user method keeps its `this`
null == (_ref = obj.getArr) ? void 0 : _at(_ref2 = _ref.call(obj)).call(_ref2, 0);
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a TS-cast (or paren / non-null) wrapper around the method callee must still be recognized as
// an optional method call: peel the transparent wrapper so the call routes through
// `_ref.call(recv)` and keeps `this` (after TS erasure this is `obj.getArr?.()`, binding obj)
null == (_ref = obj.getArr) ? void 0 : _at(_ref2 = _ref.call(obj)).call(_ref2, 0);
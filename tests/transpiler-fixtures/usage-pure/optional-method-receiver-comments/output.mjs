import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A raw optional method owns its receiver comment once.
// Dispatching the following instance call does not repeat it.
null == (_ref = obj /* receiver */.method) ? void 0 : _at(_ref2 = _ref.call(obj)).call(_ref2, 0);
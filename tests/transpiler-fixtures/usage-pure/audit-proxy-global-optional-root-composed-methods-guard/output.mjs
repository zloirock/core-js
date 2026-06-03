import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// proxy-global member as the optional-chain root (`globalThis.list?....`) feeding two composed
// instance methods: the inner `flat()` result memoizes into the outer `includes` receiver, and the
// short-circuit guard captures the root. the guard text must resolve the proxy-global leaf to its
// pure import (`_globalThis.list`), not emit raw `globalThis` (a ReferenceError on engines lacking it)
null == (_ref = _globalThis.list) ? void 0 : _includes(_ref2 = _flatMaybeArray(_ref).call(_ref)).call(_ref2, 1);
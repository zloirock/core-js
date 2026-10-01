import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// computed-key proxy-global member as the optional-chain root (`globalThis['list']?....`): the
// guard-root resolver must rebuild the bracket accessor onto the pure import (`_globalThis['list']`),
// not leak raw `globalThis` - exercises the computed branch of the proxy-global chain resolver
null == (_ref = _globalThis['list']) ? void 0 : _includes(_ref2 = _flatMaybeArray(_ref).call(_ref)).call(_ref2, 1);
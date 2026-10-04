import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3;
// nested proxy-global forwarder chain (`globalThis.self` - self forwards to the global namespace too)
// ending in a static, optional call on a non-static member, multi-trailing. the WHOLE forwarder chain
// must collapse to the static's pure ctor (`globalThis.self.Map` -> `_Map`) - collapsing only the inner
// forwarder (`_self.Map`) strands `.Map` on the absent native Map on engines without it
const r = null == (_ref = _Map.notAMethod) ? void 0 : _at(_ref2 = _flatMaybeArray(_ref3 = _ref.call(_Map)).call(_ref3)).call(_ref2, 0);
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3;
// optional call on a non-static member of a proxy-global static (`globalThis.Map`), routed
// through the combined-chain path by TWO trailing polyfilled methods. the proxy-global static
// receiver must collapse to its pure ctor (`_Map`) - leaving `_globalThis.Map` references the
// absent native Map on engines without it and TypeErrors on the `.notAMethod` access
const r = null == (_ref = _Map.notAMethod) ? void 0 : _at(_ref2 = _flatMaybeArray(_ref3 = _ref.call(_Map)).call(_ref3)).call(_ref2, 0);
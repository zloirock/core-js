import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3, _ref4;
// proxy-global accessed through an ALIAS binding (`const g = globalThis; g.Map`): the static still
// collapses to its pure ctor (`g.Map` -> `_Map`) because the binding follows to a proxy-global, while
// the alias assignment keeps the leaf swap (`g = _globalThis`). leaving `g.Map` reads the absent native
// Map on engines without it. distinct trailing methods so each line's import is unambiguous
const g = _globalThis;
const r = null == (_ref = _Map, _ref2 = _ref.notAMethod) ? void 0 : _at(_ref3 = _flatMaybeArray(_ref4 = _ref2.call(_ref)).call(_ref4)).call(_ref3, 0);
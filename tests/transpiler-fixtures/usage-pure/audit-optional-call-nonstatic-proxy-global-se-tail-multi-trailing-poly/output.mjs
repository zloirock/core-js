import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3, _ref4;
// SE-tail proxy-global static receiver (`(inc(), globalThis).Map`), routed through the combined-chain
// path by two trailing polyfilled methods. the proxy-global static must collapse to its pure ctor
// while the leading effect stays ahead in eval order: `(inc(), _Map)`. leaving `(inc(), _globalThis).Map`
// references the absent native Map on engines without it and TypeErrors on the `.notAMethod` access
let calls = 0;
const inc = () => {
  calls += 1;
  return 0;
};
const r = null == (_ref = (inc(), _Map), _ref2 = _ref.notAMethod) ? void 0 : _at(_ref3 = _flatMaybeArray(_ref4 = _ref2.call(_ref)).call(_ref4)).call(_ref3, 0);
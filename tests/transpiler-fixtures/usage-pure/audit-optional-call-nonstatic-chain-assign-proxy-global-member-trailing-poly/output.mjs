import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3, _ref4;
// chain-assign receiver of a proxy-global static, multi-trailing (combined-chain path): the static
// must collapse to its pure ctor AND the assignment side effect must survive, as a sequence
// `(a = _globalThis, _Map)` - dropping the assignment loses `a`, keeping `.Map` reads the absent
// native Map on engines without it. mirrors the natural visitor / single-trailing emit
let a;
const r = null == (_ref = (a = _globalThis, _Map), _ref2 = _ref.notAMethod) ? void 0 : _at(_ref3 = _flatMaybeArray(_ref4 = _ref2.call(_ref)).call(_ref4)).call(_ref3, 0);
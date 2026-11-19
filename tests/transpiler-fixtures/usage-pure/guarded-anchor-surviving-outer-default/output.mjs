import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// A guarded native constructor read keeps its default and the claims inside it.
let saved;
const name = _nameMaybeFunction((_ref = (saved = null == _globalThis.window ? void 0 : _self, saved === _globalThis ? _Map : saved.Map)) === void 0 ? (_atMaybeArray(_ref2 = [1]).call(_ref2, 0), fallback()) : _ref);
export {};
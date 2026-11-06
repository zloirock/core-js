import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// Quiet optional realm navigation keeps its probe. Effectful realm keys and nested calls stay live.
const log = [];
export const v1 = null == _globalThis.window ? void 0 : _self;
export const v2 = null == (_ref = _globalThis.window?.[_pushMaybeArray(log).call(log, "k"), "self"]) ? void 0 : _atMaybeArray(_ref2 = _ref.Array.of(7)).call(_ref2, 0);
export const v3 = _Array$from;
use(v1, v2, v3, log);
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// an OPTIONAL root does not erase the guard of a deeper environment probe: the inner `?.`'s
// probe (`globalThis`) is defined, but the hop's own READ (`window`) is not backed, and THAT
// value is what the next `?.` tests. the always-defined chain still erases whole
const log = [];
export const v1 = null == _globalThis.window ? void 0 : _self;
export const v2 = null == (_ref = null == _globalThis.window ? void 0 : (_pushMaybeArray(log).call(log, "k"), _self)) ? void 0 : _atMaybeArray(_ref2 = _Array$of(7)).call(_ref2, 0);
export const v3 = _Array$from;
use(v1, v2, v3, log);
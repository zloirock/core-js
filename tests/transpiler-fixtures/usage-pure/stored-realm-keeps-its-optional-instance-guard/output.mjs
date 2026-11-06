import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _self from "@core-js/pure/actual/self";
var _ref;
// A store of self leaves the following window read dependent on the environment.
let held;
export const last = null == (held = _self).window ? void 0 : _atMaybeArray(_ref = _Array$from([1, 2])).call(_ref, -1);
export const iter = null == (held = _self).window ? void 0 : _getIterator(_Array$from([3]));
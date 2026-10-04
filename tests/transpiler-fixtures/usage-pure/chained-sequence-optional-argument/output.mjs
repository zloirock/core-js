import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// The optional member guards the whole sequence value. Its prefix stays inside
// that memo, and the argument's independent method claim is served on the first pass.
const nr = () => _globalThis;
export const r = null == (_ref = (null == nr().window ? void 0 : _self.probeGen.arr, null == nr().window ? void 0 : _self.probeGen.arr)) ? void 0 : _concatMaybeArray(_ref2 = _flatMaybeArray(_ref).call(_ref)).call(_ref2, (null == (_ref3 = (null == nr().window ? void 0 : _self.probeGen.arr, null == nr().window ? void 0 : _self.probeGen.arr)) ? void 0 : _flatMaybeArray(_ref3).call(_ref3)) ?? []);
use(r);
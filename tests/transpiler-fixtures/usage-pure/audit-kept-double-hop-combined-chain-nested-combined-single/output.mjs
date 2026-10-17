import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5;
// the SINGLE-hop spelling converges on the same emission: the root guard is a test of its own
// ahead of the mid-chain lookup, and the root guard memo prunes once the claim stops reading it
let w2;
export const nestedCombinedSingle = null == (w2 = _globalThis.window) || null == (_ref = _flatMaybeArray(_ref2 = _Array$of(6))) || null == (_ref3 = _mapMaybeArray(_ref4 = _ref.call(_ref2))) ? void 0 : _atMaybeArray(_ref5 = _ref3.call(_ref4, x => x))?.call(_ref5, 0);
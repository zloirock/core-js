import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a CHAIN-ASSIGN wrapper around the proven call root rides the nested test verbatim - the
// write runs exactly once, the branch reads the ponyfill leaf
let heldRoot;
const ca2 = () => _globalThis;
export const viaChainAssignSwap = null == (heldRoot = ca2())?.window ? void 0 : _atMaybeArray(_ref = _Array$of(15)).call(_ref, 0);
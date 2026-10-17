import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// a CHAIN-ASSIGN root with an SE-carrying provable body folds BOTH effects (the write and the
// body) into the sequence prefix, exactly once, and the branch reads the ponyfill leaf
let heldSe,
  seBodyCount = 0;
const cse = () => {
  seBodyCount++;
  return _globalThis;
};
export const viaChainAssignSeBody = null == (heldSe = cse(), _self).window ? void 0 : _atMaybeArray(_ref = _Array$of(18)).call(_ref, 0);
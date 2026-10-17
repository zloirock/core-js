import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// an SE computed KEY combined with an SE CALL root in ONE sealed probe: the guard test owns
// the single call run, the alternate owns the single key run (native order test-key-read)
let cc1 = 0,
  kc1 = 0;
const dheCombo = () => {
  cc1++;
  return _globalThis;
};
export const viaSeKeySeCallRoot = _atMaybeArray(_ref = ((null == dheCombo().window ? void 0 : (kc1++, _self)).Array, _Array$of)(5)).call(_ref, 0);
export { cc1 };
export { kc1 };
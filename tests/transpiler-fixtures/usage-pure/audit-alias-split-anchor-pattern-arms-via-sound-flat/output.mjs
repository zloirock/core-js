import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// control: a FLAT sound anchor write folds the inner static through its own registration
function viaSoundFlat(values) {
  const {
    Math: M
  } = _globalThis;
  outerUse(_Math$trunc(value));
  return function inner() {
    var M;
    var {
      Math: M
    } = _globalThis;
    return _Math$sumPrecise(values);
  };
}
export const results = [viaSoundFlat];
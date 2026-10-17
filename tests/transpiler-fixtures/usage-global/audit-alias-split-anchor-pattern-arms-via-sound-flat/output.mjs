import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.math.trunc";
// control: a FLAT sound anchor write folds the inner static through its own registration
function viaSoundFlat(values) {
  const {
    Math: M
  } = globalThis;
  outerUse(M.trunc(value));
  return function inner() {
    var M;
    var {
      Math: M
    } = globalThis;
    return M.sumPrecise(values);
  };
}
export const results = [viaSoundFlat];
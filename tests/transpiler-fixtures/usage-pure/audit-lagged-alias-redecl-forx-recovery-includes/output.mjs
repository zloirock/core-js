import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// a `var` of the same name in a DEEPER nested function is not a shadow at the writing
// function's level: the write there still counts and widens the member to generic
let D;
D = _Map;
function outer() {
  function inner() {
    var D = 0;
    return D;
  }
  D = ['d'];
  return inner;
}
export const r4 = [_includes(D).call(D, 'd'), outer()];
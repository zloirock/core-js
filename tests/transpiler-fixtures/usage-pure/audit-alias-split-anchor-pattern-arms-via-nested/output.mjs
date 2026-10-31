import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// nested-pattern write: reads `globalThis.constructor.Array`, not the global - stays native
function viaNested(items) {
  const {
    Array: A
  } = _globalThis;
  outerUse(_Array$of(one, two));
  return function inner() {
    var A;
    var {
      constructor: {
        Array: A
      }
    } = _globalThis;
    return A.fromAsync(items);
  };
}
export const results = [viaNested];
import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A static initializer sequence runs once before its binding and the following plain sibling.
let traced = 0;
function se() {
  traced++;
  return _globalThis;
}
const {
    Array: {
      from
    }
  } = (se(), {
    Array: {
      from: _Array$from
    }
  }),
  x = 1;
from([1, 2, 3]);
console.log(x, traced);
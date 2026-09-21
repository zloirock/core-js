import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// An iterator extraction reads the nested receiver without replaying sibling effects.
let count = 0,
  method,
  z;
const hit = () => ++count;
({
  z
} = {
  z: (hit(), 1),
  w: (hit(), _globalThis)
});
method = _getIteratorMethod(_globalThis);
use(method, z, count);
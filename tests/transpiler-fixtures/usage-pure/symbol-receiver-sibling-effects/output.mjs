import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A nested iterator read keeps the full initializer once, including sibling effects.
let count = 0;
const hit = () => ++count;
const _ref = {
  z: (hit(), 1),
  w: (hit(), _globalThis)
};
const method = _getIteratorMethod(_globalThis);
const {
  z
} = _ref;
use(method, z, count);
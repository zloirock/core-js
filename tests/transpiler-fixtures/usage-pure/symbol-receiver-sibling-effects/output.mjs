import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal sibling effects run in property construction order before the iterator read.
// The iterator helper uses the selected realm slot without replaying those effects.
let count = 0;
const hit = () => ++count;
const _ref = {
  z: (hit(), 1),
  w: (hit(), _globalThis)
};
const method = _getIteratorMethod(_ref.w);
const {
  z
} = _ref;
use(method, z, count);
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _WeakMap from "@core-js/pure/actual/weak-map";
// A retained source prefix runs while the extracted binding is still uninitialized.
let seen;
function observe() {
  try {
    seen = typeof isInteger;
  } catch (error) {
    seen = _nameMaybeFunction(error);
  }
}
const {
  Number: _ref
} = (observe(), _globalThis);
const {} = _ref;
const isInteger = _Number$isInteger;
const {
  isInteger: _unused,
  ...numbers
} = _ref;
const W = _WeakMap;
use(seen, isInteger, numbers, W);
import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A nested static with a sequence initializer preserves its prefix once.
// The effect runs before the binding receives the pure method.
function se() {
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
});
from([1, 2]);
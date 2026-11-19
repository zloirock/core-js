import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
function realm() {
  return _globalThis;
}
for (var before = effect('before'), {
    Array: {
      isArray
    }
  } = (effect('prefix'), realm()), flat = _flatMaybeArray(_globalThis.Array.prototype), after = effect('after');;) {
  use(before, flat, isArray, after);
  break;
}
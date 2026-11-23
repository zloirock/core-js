import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
function realm() {
  return _globalThis;
}
for (var before = effect('before'), _ref2 = (effect('prefix'), realm()), {
    Array: _ref
  } = _ref2, {
    prototype: _ref3
  } = _ref, flat = _flatMaybeArray(_ref3), {
    isArray
  } = _ref, after = effect('after');;) {
  use(before, flat, isArray, after);
  break;
}
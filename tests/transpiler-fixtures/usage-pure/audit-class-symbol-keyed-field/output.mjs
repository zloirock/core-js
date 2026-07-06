import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// class method with computed `[Symbol.iterator]` key - polyfill provider must recognise
// the well-known Symbol member and substitute the pure binding in the computed key
// (`[_Symbol$iterator]`), the uniform behavior for every computed well-known-symbol method key.
// the method returns array elements; the iteration site narrows
class Box {
  [_Symbol$iterator]() {
    var _ref;
    return _valuesMaybeArray(_ref = [1, 2, 3]).call(_ref);
  }
}
const b = new Box();
for (const x of b) _toFixedMaybeNumber(x).call(x, 2);
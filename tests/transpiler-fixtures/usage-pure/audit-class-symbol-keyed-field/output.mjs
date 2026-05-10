import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// class field with computed `[Symbol.iterator]` key - polyfill provider must recognise
// the well-known Symbol member, emit Symbol.iterator polyfill side-effect import, NOT
// substitute `Symbol.iterator` in the computed key (it would corrupt the class shape).
// the field's value is a generator returning array elements; iteration site narrows
class Box {
  [_Symbol$iterator]() {
    var _ref;
    return _valuesMaybeArray(_ref = [1, 2, 3]).call(_ref);
  }
}
const b = new Box();
for (const x of b) _toFixedMaybeNumber(x).call(x, 2);
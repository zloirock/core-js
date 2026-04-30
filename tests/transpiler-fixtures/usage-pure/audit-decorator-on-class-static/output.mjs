import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
// Decorator wrapping a class with static method using a polyfilled API. babel emits
// Decorator wrapper around expression; oxc emits same shape but visitor keys differ.
// Test that decorators don't shield the inner Array.from from polyfill detection
function dec(target: any) {
  return target;
}
@dec
class Holder {
  static load() {
    var _ref;
    return _atMaybeArray(_ref = _Array$from([1, 2, 3])).call(_ref, 0);
  }
}
new Holder();
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A method getter changes the receiver binding during lookup. The call keeps
// the value captured before that getter, even without a computed-key effect.
let arr = ['held'];
Object.defineProperty(arr, 'at', {
  get() {
    arr = ['swapped'];
    return function (index) {
      return this[index];
    };
  }
});
export const result = _atMaybeArray(_ref = arr).call(_ref, 0);
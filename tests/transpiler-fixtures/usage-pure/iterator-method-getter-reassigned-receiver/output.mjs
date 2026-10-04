import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// An own iterator getter can reassign the binding holding its receiver.
// Calling the selected method with arguments retains the original receiver as this.
let arr = ['held'];
_Object$defineProperty(arr, _Symbol$iterator, {
  get() {
    arr = ['swapped'];
    return function (index) {
      return {
        next: () => ({
          value: this[index]
        })
      };
    };
  }
});
export const result = _getIteratorMethod(_ref = arr).call(_ref, 0).next().value;
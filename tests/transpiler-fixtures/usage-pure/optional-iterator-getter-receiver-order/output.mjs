import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// An optional iterator lookup can invoke a getter that replaces its receiver binding.
// The retrieved method must be called on the original object, with both nullish
// guards preserved through the later iterator result reads.
let arr = ['outer'];
const after = ['inner'];
_Object$defineProperty(arr, _Symbol$iterator, {
  get() {
    arr = after;
    return function () {
      const value = this[0];
      return {
        next() {
          return {
            value,
            done: false
          };
        }
      };
    };
  }
});
export const result = null == (_ref = arr) ? void 0 : _getIteratorMethod(_ref)?.call(_ref).next().value;
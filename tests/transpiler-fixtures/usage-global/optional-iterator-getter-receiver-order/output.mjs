import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An optional iterator lookup can invoke a getter that replaces its receiver binding.
// The retrieved method must be called on the original object, with both nullish
// guards preserved through the later iterator result reads.
let arr = ['outer'];
const after = ['inner'];
Object.defineProperty(arr, Symbol.iterator, {
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
export const result = arr?.[Symbol.iterator]?.().next().value;
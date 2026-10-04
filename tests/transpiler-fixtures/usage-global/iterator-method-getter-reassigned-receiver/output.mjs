import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An own iterator getter can reassign the binding holding its receiver.
// Calling the selected method with arguments retains the original receiver as this.
let arr = ['held'];
Object.defineProperty(arr, Symbol.iterator, {
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
export const result = arr[Symbol.iterator](0).next().value;
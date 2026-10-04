import "core-js/modules/es.array.at";
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
export const result = arr.at(0);
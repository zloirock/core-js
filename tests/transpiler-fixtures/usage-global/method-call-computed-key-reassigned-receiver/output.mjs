import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A folded computed key reassigns the receiver. Capture its original value before
// replaying the key so method selection and the call use the same receiver.
let arr = [1, [2]];
export const result = arr[(() => (arr = {
  flat: () => 'swapped'
}, 'flat'))()]();
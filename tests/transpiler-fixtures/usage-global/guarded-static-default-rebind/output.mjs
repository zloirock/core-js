import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// A default may rebind the source variable before the next slot is read.
// Guarded reads retain the original receiver throughout the pattern.
let M = pickConstructor();
if (!M) M = Array;
const {
  of: method = (M = {}, 1),
  from
} = M;
export { method, from };
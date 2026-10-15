import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// Object rest over an uncertain constructor retains its native named reads.
// Its exclusions and the user's default remain in the original pattern.
let M = pickConstructor();
if (!M) M = Array;
const {
  from,
  of: method = 1,
  ...rest
} = M;
export { from, method, rest };
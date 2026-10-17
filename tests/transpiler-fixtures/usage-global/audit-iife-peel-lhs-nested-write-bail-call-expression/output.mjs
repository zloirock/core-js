import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Writes inside assignment targets invalidate the returned-argument proof.
// The local calls keep their arguments in this file; global injection covers the selected
// static keys across the possible receivers without loading whole constructor families.
let x;
const viaLhsDefault = (arg => {
  ({
    x = arg = Promise
  } = {});
  return arg;
})(Array);
const {
  from
} = viaLhsDefault;
export const r1 = from([1, 2]);
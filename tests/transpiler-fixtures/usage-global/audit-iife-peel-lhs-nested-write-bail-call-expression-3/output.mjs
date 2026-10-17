import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
const counts = {
  rebound: 0
};
const viaUpdateKey = (arg => {
  counts[arg = Promise]++;
  return arg;
})(Array);
const {
  from: fu
} = viaUpdateKey;
export const r3 = fu([4]);
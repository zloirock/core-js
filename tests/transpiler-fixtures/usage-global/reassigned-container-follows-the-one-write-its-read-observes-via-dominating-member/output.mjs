import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
let rw2 = {
  s: Object
};
rw2 = {
  s: Array
};
export const viaDominatingMember = rw2.s.from([1]);
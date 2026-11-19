import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A member passed as an argument is a value read, not the surrounding call.
class Bag extends Array {}
function read(from) {
  return typeof from;
}
export const result = read(Bag.from);
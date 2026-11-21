import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
function read(drop) {
  class Bag extends Array {
    static from() {
      return [9];
    }
  }
  if (drop) delete Bag.from;
  return Bag.from([1])[0];
}
export const result = [read(false), read(true)];
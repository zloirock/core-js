import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
export function nested() {
  let list = [3, 4];
  ({
    a: {
      b: list = [1].keys()
    }
  } = {
    a: {
      b: undefined
    }
  });
  return list.filter(x => x);
}
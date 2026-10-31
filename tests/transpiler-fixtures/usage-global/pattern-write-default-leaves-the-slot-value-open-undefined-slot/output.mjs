import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
export function undefinedSlot() {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: undefined
  });
  return list.includes(3);
}
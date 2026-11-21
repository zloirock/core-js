import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
export function selected(pick) {
  const {
    Array: {
      prototype: {
        map
      }
    }
  } = pick && globalThis;
  return map;
}
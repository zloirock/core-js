import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Optional symbol keys retain their nullish result.
export function read(choice) {
  const effects = [];
  const list = {
    undefined: 23,
    [Symbol.iterator]() {
      return 31;
    }
  };
  function pick({
    [globalThis.window?.Symbol.iterator]: it
  }) {
    return typeof it;
  }
  return pick(list);
}
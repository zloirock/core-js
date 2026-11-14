import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const list = [1];
  const get = () => (effects.push(3), globalThis);
  const it = list[(effects.push(1), effects.push(2), get())[effects.push(4), "Symbol"].iterator];
  return it.call(list).next().value;
}
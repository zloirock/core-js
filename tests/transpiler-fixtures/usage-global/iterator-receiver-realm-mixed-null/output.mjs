import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const w = choice ? globalThis : null;
  return w.Symbol.iterator in [3];
}
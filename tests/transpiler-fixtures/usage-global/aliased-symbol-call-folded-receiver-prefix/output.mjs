import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A symbol-key alias consumes a receiver with a prefix and computed proxy-hop effect.
// The folded receiver retains its own call and hop effects, so they must not replay outside it.
// The outer prefix can sit beside iterator consumption or inside its receiver argument.
const key = Symbol.iterator;
function getRealm() {
  setup();
  return globalThis;
}
export const result = (prefix(), getRealm()[hop(), 'self'])[key]();
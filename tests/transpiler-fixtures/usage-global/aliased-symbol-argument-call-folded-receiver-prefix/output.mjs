import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// An argument call through a symbol-key alias retains the selected receiver as this.
// The folded receiver owns its call and hop effects after the outer prefix runs.
// The outer prefix can sit beside iterator consumption or inside its receiver argument.
const key = Symbol.iterator;
function getRealm() {
  setup();
  return globalThis;
}
export const result = (prefix(), getRealm()[hop(), 'self'])[key](42);
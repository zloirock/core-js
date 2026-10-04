import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// An argument call after a sealed optional symbol lookup keeps the captured proxy as this.
// Its receiver call and hop effects must not replay in the key's guarded evaluation.
const key = Symbol.iterator;
function getRealm() {
  setup();
  return globalThis;
}
export const result = (getRealm()[hop(), 'self']?.[key])(42);
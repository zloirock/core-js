import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A sealed optional lookup through a symbol-key alias captures its folded proxy receiver.
// Its receiver call and hop effects belong to that capture and run once before consumption.
const key = Symbol.iterator;
function getRealm() {
  setup();
  return globalThis;
}
export const result = (getRealm()[hop(), 'self']?.[key])();
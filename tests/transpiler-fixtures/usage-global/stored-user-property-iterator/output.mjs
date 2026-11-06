import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The iterator call receives the user's self object, with the store evaluated once.
let held;
export const value = (held = globalThis.host).self[Symbol.iterator]().next().value;
export { held };
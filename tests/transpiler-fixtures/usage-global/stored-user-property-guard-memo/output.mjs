import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// An outer store keeps the possibly absent value of the user's self property.
let held, inner;
export const value = (held = (inner = globalThis.host).self)?.list.includes(1);
export { held, inner };
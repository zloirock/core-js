import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A backed realm constructor makes the logical fallback inert.
// Its computed key still runs once before the static binding is read.
let count = 0;
const {
  getOwnPropertyNames
} = globalThis.self[count++, 'window'].Object || Object;
export const result = getOwnPropertyNames({
  z: 1
});
export { count };
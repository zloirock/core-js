import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.global-this";
// The sequence consumes the Reflect namespace before the outer method read.
let e = 0;
export const d = (e++, globalThis.Reflect).deleteProperty(obj4, 'k');
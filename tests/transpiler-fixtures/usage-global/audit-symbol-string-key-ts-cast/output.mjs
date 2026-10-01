import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a TS cast around a computed key is transparent for provenance: a cast STRING spelling of the
// well-known symbol stays a plain property read, while a cast real symbol reference keeps its
// iterator-method routing
const arr = [1, 2];
export const stringKey = arr['Symbol.iterator' as string];
export const realKey = arr[Symbol.iterator as typeof Symbol.iterator]();
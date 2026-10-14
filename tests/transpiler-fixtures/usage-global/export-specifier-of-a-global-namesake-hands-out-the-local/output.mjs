import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an export specifier hands out the binding it names, resolved where the export stands: a local named
// like a global holds the file's own value, so the global read beside it keeps its narrow entry. an
// import of such a name may hold the realm's value, which only the flavor patching the global slot
// answers for - as it does for the import handed to a call
import { Map } from './map.js';
const Promise = makePromise();
export { Promise, Map as Dictionary };
export const pending = new globalThis.Promise(resolve => resolve());
export const table = new globalThis.Map();
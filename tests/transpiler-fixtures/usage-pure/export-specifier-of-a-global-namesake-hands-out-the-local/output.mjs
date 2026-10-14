import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// an export specifier hands out the binding it names, resolved where the export stands: a local named
// like a global holds the file's own value, so the global read beside it keeps its narrow entry. an
// import of such a name may hold the realm's value, which only the flavor patching the global slot
// answers for - as it does for the import handed to a call
import { Map } from './map.js';
const Promise = makePromise();
export { Promise, Map as Dictionary };
export const pending = new _Promise(resolve => resolve());
export const table = new _Map();
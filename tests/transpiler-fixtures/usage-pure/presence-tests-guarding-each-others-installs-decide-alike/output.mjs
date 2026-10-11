import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// two installs each guarded by a presence test of the other's global: both tests read what this build
// serves, so both installs are dead whichever is settled first, and every read takes the pure import.
// usage-pure only: the global flavor reads no install
if (typeof _Promise == 'undefined') _globalThis.Map = MapShim;
if (typeof _Map == 'undefined') _globalThis.Promise = PromiseShim;
export const ready = _Promise$resolve(1);
export const cache = new _Map();
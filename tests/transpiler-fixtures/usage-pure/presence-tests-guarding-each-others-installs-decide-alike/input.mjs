// two installs each guarded by a presence test of the other's global: both tests read what this build
// serves, so both installs are dead whichever is settled first, and every read takes the pure import.
// usage-pure only: the global flavor reads no install
if (typeof Promise == 'undefined') globalThis.Map = MapShim;
if (typeof Map == 'undefined') globalThis.Promise = PromiseShim;
export const ready = Promise.resolve(1);
export const cache = new Map();

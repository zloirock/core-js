// a write of the global no hypothesis takes - an install through a destructure, a delete - decides with the
// installs beside it whichever comes first: with the installs taken as never running, its test reads what the
// build serves, so it never runs either, and every read takes the pure import
function installPromiseByDestructuring() { if (!globalThis.Promise) [globalThis.Promise] = [PromiseShim]; }
function installPromise() { if (!globalThis.Promise) globalThis.Promise = PromiseShim; }
export const ready = Promise.resolve(1);
if (typeof Set == 'undefined') delete globalThis.Set;
function installSet() { if (!globalThis.Set) globalThis.Set = SetShim; }
function installSetAgain() { if (!globalThis.Set) globalThis.Set = SetShim; }
export const unique = new Set(list);

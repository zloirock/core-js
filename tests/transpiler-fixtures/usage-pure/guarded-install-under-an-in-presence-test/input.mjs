// A guarded install under an `in` presence test the build answers never runs: the data subset carries the
// constructor, so the test is decided, the write mutates no slot and the bare constructor read takes what the
// build serves, whatever realm spells the test (`globalThis`, `self`). A test over `window`, which may be absent,
// decides nothing: the install stays live and the read follows the slot - native where present, the shim where not.
if (!('Set' in globalThis)) globalThis.Set = SetShim;
if (!('Promise' in self)) self.Promise = PromiseShim;
if (!('WeakMap' in window)) window.WeakMap = WeakMapShim;
export const set = new Set();
export const promise = new Promise(run);
export const weakMap = new WeakMap();

import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// A guarded install under an `in` presence test the build answers never runs: the data subset carries the
// constructor, so the test is decided, the write mutates no slot and the bare constructor read takes what the
// build serves, whatever realm spells the test (`globalThis`, `self`). A test over `window`, which may be absent,
// decides nothing: the install stays live and the read follows the slot - native where present, the shim where not.
if (!true) _globalThis.Set = SetShim;
if (!true) _self.Promise = PromiseShim;
if (!('WeakMap' in window)) window.WeakMap = WeakMapShim;
export const set = new _Set();
export const promise = new _Promise(run);
export const weakMap = new WeakMap();
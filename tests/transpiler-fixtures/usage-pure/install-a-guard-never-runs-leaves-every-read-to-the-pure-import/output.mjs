import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a polyfill install guarded by a presence test of the slot it patches never runs in this build: the test
// reads what the build serves, so the install arm is dead, the slot is never written, and every read of it
// - ahead of the install, after it, deferred into a function, in the other arm - takes the pure import. an
// install spelled as an `&&` statement folds to the test's answer alone, and that statement leaves
if (typeof _Promise === 'undefined') _self.Promise = PromiseShim;
export const resolved = _Promise$resolve(1);
export function loadAll(urls) {
  return _Promise$all(urls);
}
export const tag = _Symbol('tag');
if (typeof _WeakMap !== 'function') _globalThis.WeakMap = WeakMapShim;else instrument(_WeakMap);
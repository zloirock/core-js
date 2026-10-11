// a polyfill install guarded by a presence test of the slot it patches never runs in this build: the test
// reads what the build serves, so the install arm is dead, the slot is never written, and every read of it
// - ahead of the install, after it, deferred into a function, in the other arm - takes the pure import. an
// install spelled as an `&&` statement folds to the test's answer alone, and that statement leaves
if (typeof Promise === 'undefined') self.Promise = PromiseShim;
export const resolved = Promise.resolve(1);
export function loadAll(urls) {
  return Promise.all(urls);
}
typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim);
export const tag = Symbol('tag');
if (typeof WeakMap !== 'function') globalThis.WeakMap = WeakMapShim;
else instrument(WeakMap);

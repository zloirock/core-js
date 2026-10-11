import _globalThis from "@core-js/pure/actual/global-this";
// installs of one global in frames of their own decide one another only where every one of them is decided: one
// under a test the build cannot answer, or a wrap of the global, which runs wherever the global is present, may
// run, the other's test cannot read ahead of it, and both stay open - the reads keep the user's slot. a bare-name
// write keeps the name deopted, and a static install keeps the receiver of its reads
function installPromise() {
  if (!_globalThis.Promise) _globalThis.Promise = PromiseShim;
}
function checkPromise() {
  if (!_globalThis.Promise || Promise.length !== 1) _globalThis.Promise = PromiseShim;
}
export const ready = Promise.resolve(1);
function wrapSet() {
  if (_globalThis.Set) _globalThis.Set = wrapped(_globalThis.Set);
}
function installSet() {
  if (!_globalThis.Set) _globalThis.Set = SetShim;
}
export const unique = new Set(list);
function installWeakSet() {
  if (typeof WeakSet == 'undefined') WeakSet = WeakSetShim;
}
function installWeakSetAgain() {
  if (typeof WeakSet == 'undefined') WeakSet = WeakSetShim;
}
export const seen = new WeakSet();
function installFrom() {
  if (!Array.from) Array.from = arrayFrom;
}
function installFromAgain() {
  if (!Array.from) Array.from = arrayFrom;
}
export const copy = Array.from(list);
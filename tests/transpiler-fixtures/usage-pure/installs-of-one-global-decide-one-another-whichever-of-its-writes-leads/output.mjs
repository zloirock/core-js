import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
// a write of the global no hypothesis takes - an install through a destructure, a delete - decides with the
// installs beside it whichever comes first: with the installs taken as never running, its test reads what the
// build serves, so it never runs either, and every read takes the pure import
function installPromiseByDestructuring() {
  if (!_Promise) [_globalThis.Promise] = [PromiseShim];
}
function installPromise() {
  if (!_Promise) _globalThis.Promise = PromiseShim;
}
export const ready = _Promise$resolve(1);
if (typeof _Set == 'undefined') delete _globalThis.Set;
function installSet() {
  if (!_Set) _globalThis.Set = SetShim;
}
function installSetAgain() {
  if (!_Set) _globalThis.Set = SetShim;
}
export const unique = new _Set(list);
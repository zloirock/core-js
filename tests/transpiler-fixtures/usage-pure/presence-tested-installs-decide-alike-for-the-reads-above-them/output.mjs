import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// whether an install under a presence test runs is one answer whoever asks it first - a read above the
// installs, or the test of another install - so every read takes the pure import in both legs, through one
// binding per global: two installs guarding each other, and two tests of one global
function useA() {
  return _Promise$resolve(1);
}
function useB() {
  return new _Map();
}
if (typeof _Promise == 'undefined') _globalThis.Map = MapShim;
if (typeof _Map == 'undefined') _globalThis.Promise = PromiseShim;
export const tag = () => _Symbol('tag');
if (!_Symbol) _globalThis.Symbol = SymbolShim;
if (typeof _Symbol == 'undefined') _globalThis.Symbol = SymbolShim;
export { useA, useB };
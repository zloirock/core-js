import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a presence test reading a name its function's own body binds - `const` or `let`, in a function, an
// arrow or a method - is asked in that function's scope like a `var` or a top-level name: the build
// decides it, so a write under it never runs. an install leaves the reads after it on what the build
// serves, and a prototype install leaves the binding the family its initializer built. distinct global
// and method per host
export function viaConst(list) {
  const g = _globalThis;
  if (!_Map) g.Map = MapShim;
  return _Map$groupBy(list, key);
}
export const viaArrow = name => {
  const g = _self;
  if (!_Symbol) g.Symbol = SymbolShim;
  return _Symbol$for(name);
};
export class Host {
  settle(list) {
    let g = _globalThis;
    if (typeof _Promise == 'undefined') g.Promise = PromiseShim;
    return _Promise$allSettled(list);
  }
}
export function typed() {
  const g = _globalThis;
  const list = [1];
  if (!_WeakMap) Object.setPrototypeOf(list, String.prototype);
  return _atMaybeArray(list).call(list, -1);
}
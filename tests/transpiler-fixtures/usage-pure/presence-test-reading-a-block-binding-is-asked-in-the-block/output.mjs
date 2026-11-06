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
// a presence test reading a name a block around it binds - a loader's `if` body, a `case`, a bare block
// rebinding a name the file binds otherwise - is asked in that block's scope: the build decides it, so a
// write under it never runs. an install leaves the reads after it on what the build serves, a prototype
// install leaves the binding the family its initializer built. distinct global and method per host
if (typeof _globalThis != 'undefined') {
  const g = _globalThis;
  if (!_Map) g.Map = MapShim;
}
switch (mode) {
  case 1:
    const host = _globalThis;
    if (typeof _Promise == 'undefined') host.Promise = PromiseShim;
}
const realm = {};
{
  const realm = _self;
  if (!_Symbol) realm.Symbol = SymbolShim;
}
const list = [1];
{
  const g = _globalThis;
  if (!_WeakMap) Object.setPrototypeOf(list, String.prototype);
}
export const grouped = _Map$groupBy(items, key);
export const settled = _Promise$allSettled(items);
export const shared = _Symbol$for(name);
export const last = _atMaybeArray(list).call(list, -1);
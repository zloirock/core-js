import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// a presence test reading a name a block around it binds - a loader's `if` body, a `case`, a bare block
// rebinding a name the file binds otherwise - is asked in that block's scope: the build decides it, so a
// write under it never runs. an install leaves the reads after it on what the build serves, a prototype
// install leaves the binding the family its initializer built. distinct global and method per host
if (typeof globalThis != 'undefined') {
  const g = globalThis;
  if (!g.Map) g.Map = MapShim;
}
switch (mode) {
  case 1:
    const host = globalThis;
    if (typeof host.Promise == 'undefined') host.Promise = PromiseShim;
}
const realm = {};
{
  const realm = self;
  if (!realm.Symbol) realm.Symbol = SymbolShim;
}
const list = [1];
{
  const g = globalThis;
  if (!g.WeakMap) Object.setPrototypeOf(list, String.prototype);
}
export const grouped = Map.groupBy(items, key);
export const settled = Promise.allSettled(items);
export const shared = Symbol.for(name);
export const last = list.at(-1);
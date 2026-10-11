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

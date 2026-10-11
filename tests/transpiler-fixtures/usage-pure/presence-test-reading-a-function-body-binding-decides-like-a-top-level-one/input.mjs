// a presence test reading a name its function's own body binds - `const` or `let`, in a function, an
// arrow or a method - is asked in that function's scope like a `var` or a top-level name: the build
// decides it, so a write under it never runs. an install leaves the reads after it on what the build
// serves, and a prototype install leaves the binding the family its initializer built. distinct global
// and method per host
export function viaConst(list) {
  const g = globalThis;
  if (!g.Map) g.Map = MapShim;
  return Map.groupBy(list, key);
}
export const viaArrow = name => {
  const g = self;
  if (!g.Symbol) g.Symbol = SymbolShim;
  return Symbol.for(name);
};
export class Host {
  settle(list) {
    let g = globalThis;
    if (typeof g.Promise == 'undefined') g.Promise = PromiseShim;
    return Promise.allSettled(list);
  }
}
export function typed() {
  const g = globalThis;
  const list = [1];
  if (!g.WeakMap) Object.setPrototypeOf(list, String.prototype);
  return list.at(-1);
}

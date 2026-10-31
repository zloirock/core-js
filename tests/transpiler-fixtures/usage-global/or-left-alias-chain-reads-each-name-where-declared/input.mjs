// a `||` / `??` left read through an alias chain is asked of each name where the one before it was declared,
// not where the left is read: a parameter shadowing a name of the chain at the read is not that name, and
// the chain's own name a write may reach keeps the right live. a chain nothing writes decides
let G = Map;
if (flag) G = null;
const H = G;
export function shadowed(G) {
  return (H || Object).groupBy;
}
const stable = WeakMap;
const T = stable;
export function control(stable) {
  return (T || Object).hasOwn;
}

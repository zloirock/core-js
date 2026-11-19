// a member read off a `||` / `??` whose left is a name a later write may empty reads both operands: the
// name holds no one value, so the right may run
let groups = Map;
let sources = Array;
export function reset() {
  groups = null;
  sources = undefined;
}
export const group = items => (groups || Object).groupBy(items, Boolean);
export const collect = items => (sources ?? Iterator).from(items);

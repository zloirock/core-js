// a callee whose returns DISAGREE pairs the slot as the union of what each return spells: pure guards
// the read against every candidate at runtime and usage-global injects the static of each. the
// returns share their static, and the Map one owes its constructor entry beside it
function pick() {
  if (flag) return { a: Object };
  return { a: Map };
}
const { a: viaReturns } = pick();
export const fromReturns = viaReturns.groupBy([1], v => v);

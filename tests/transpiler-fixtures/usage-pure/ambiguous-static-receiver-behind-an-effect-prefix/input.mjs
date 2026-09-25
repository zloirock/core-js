// an effect prefix ahead of a receiver runs where the read stands and names nothing: the read lands
// on the prefix's tail, so a receiver that may hold more than one value takes the whole entry behind
// a prefix exactly as it does bare - a slot of a selection, a slot of disagreeing returns, a member
// under an opaque iteration and a selecting realm alike
const on = [1].length > 0;
const box = on ? { A: Promise } : { A: Map };
export const viaSlot = (tick(), box.A).allSettled([]);
function make() {
  if (on) return { A: Map };
  return { A: Promise };
}
export const viaReturns = (tick(), make().A).groupBy([], x => x);
export function viaIteration(source) {
  for (const item of [{ A: Iterator }, ...source]) return (tick(), item.A).from([1]);
}
function realm() { return globalThis; }
export const viaRealm = (tick(), (on ? realm() : other()).URL).canParse('a:b');

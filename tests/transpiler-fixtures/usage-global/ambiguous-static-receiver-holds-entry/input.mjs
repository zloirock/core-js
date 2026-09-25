// a static read on a receiver that may hold more than one value names no single constructor, so pure
// reads it raw off whatever arrived - and an arm it minted a pure constructor into has to be the
// whole entry, which carries that constructor's statics. usage-global injects for every candidate
const on = [1].length > 0;
const off = [].pop();
export const viaSelection = (on ? Map : Promise).groupBy([1, 2], x => x % 2);
const alias = off || Iterator;
export const viaAlias = alias.from([1]);
const box = on ? { A: Promise } : { A: Map };
export const viaSlot = box.A.withResolvers();
function make() {
  if (on) return { A: URL };
  return { A: Map };
}
export const viaReturns = make().A.canParse('a:b');

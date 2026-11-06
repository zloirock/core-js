// mutated-static routing composes with the surrounding machineries: an SE-buried write keeps
// its prefix around the routed receiver, an in-check receiver routes inside its sequence, a
// destructure default stays on the raw pattern. a receiver whose global EXISTS on the target
// (Object) stays native on EVERY surface - the patch and the reads agree either way
(eff(), Iterator).from = c1;
export const r1 = Iterator.from(y);
Promise.try = c2;
export const r2 = 'try' in (eff2(), Promise);
Map.groupBy = c3;
const { groupBy = fb } = Map;
export const r3 = groupBy(items, fn);
Object.groupBy = c4;
function take({ groupBy: og } = Object) { return og; }
export const r4 = take();
// the patch flows through aliasing and inheritance off the routed constructor
const I = Iterator;
export const r5 = I.from(z);
class K extends Iterator {
  static make() { return super.from(w); }
}
export const r6 = K.make();

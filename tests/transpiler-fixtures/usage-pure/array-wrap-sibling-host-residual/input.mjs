// a SIBLING-declarator host keeps the wrapper a trailing neighbour holds alive for a reading claim:
// the residual stays comma-joined between its siblings (a lift would carry the neighbour over the
// leading sibling's own effect), and the dispatch reads the surface inline beside it. a spread
// buried one wrapper level down keeps its wrapper the same way, a parenthesized init reads like
// the bare one, and a bodyless assignment slot braces around the raw destructure and its overwrite
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const lead = eff('w'), [{ Array: { prototype: { findLast: besideLead } } }] = [globalThis, eff('x')];
const lead2 = eff('ab'), [{ Array: { prototype: { at: besideParen } } }] = ([globalThis, eff('ac')]);
const [[{ Object: { groupBy: nestedSpread } }]] = [[globalThis, ...xs]];
const [{ Object: { getOwnPropertyDescriptors } }] = ([(eff('y'), globalThis), eff('z')]);
let bodylessGb, bodylessZn;
if (lead) [{ Map: { groupBy: bodylessGb } }, bodylessZn] = [kw = (eff('aa'), globalThis), 7];
let outSpread;
for (const [{ Array: { prototype: { toSorted } } }] = [globalThis, ...xs]; !outSpread;) outSpread = toSorted;
export { lead, besideLead, lead2, besideParen, nestedSpread, getOwnPropertyDescriptors, bodylessGb, bodylessZn, outSpread, seen, kw };

// A sibling declarator keeps its order around a captured literal element and its trailing
// neighbour. A nested spread keeps its native wrapper, a parenthesized initializer reads like
// the bare one, and a bodyless assignment remains inside its conditional branch.
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

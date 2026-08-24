// a FOR-INIT rest sentinel has no statement slot beside the assignment it renames: its `var`
// hoists to the scope top with the generated refs, claimed where the WALK is so it declares in
// the order the refs were pushed. the shared declaration groups by FAMILY at PROGRAM level and
// keeps push order inside a function. the consuming LIFT is also the slot a buried re-anchored
// host's prefix never had - unless that prefix is a kept WRITE, which rides the value it stored
let aP, rP, oP;
for (const { isSealed } = (({ Array: { fromAsync: aP, ...rP } } = globalThis), Object); !oP;) oP = isSealed;
const recvA = getObj();
const { [Symbol.iterator]: gA = null } = recvA;
let aQ, rQ, oQ;
for (const { isFrozen } = (({ Promise: { allSettled: aQ, ...rQ } } = globalThis), Object); !oQ;) oQ = isFrozen;
// the same pair inside a FUNCTION: push order, no family grouping
export function inFn() {
  const recvB = getObj();
  const { [Symbol.iterator]: gB = null } = recvB;
  let aR, rR, oR;
  for (const { getPrototypeOf } = (({ Map: { groupBy: aR, ...rR } } = globalThis), Object); !oR;) oR = getPrototypeOf;
  const recvC = getObj();
  const { [Symbol.iterator]: gC = null } = recvC;
  return [gB, aR, rR, oR, gC];
}
// a buried re-anchored host whose SOURCE prefix the lift finally gives a statement slot
let customW, cw = 0;
export const { entries } = (({ Map: { customW } } = (cw++, globalThis)), Object);
// ... and a kept WRITE is not one of those: the value it stored is what the pattern reads
let customX, wx;
export const { keys } = (({ Map: { customX } } = (wx = globalThis)), Object);
// a chain-assignment RHS on a plain assignment host lifts the write and extracts off the value
let qS, itS;
({ Set: { [Symbol.iterator]: itS } } = (qS = globalThis));
export const r = [aP, rP, oP, gA, aQ, rQ, oQ, customW, cw, customX, wx, entries, keys, qS, itS];

// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
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

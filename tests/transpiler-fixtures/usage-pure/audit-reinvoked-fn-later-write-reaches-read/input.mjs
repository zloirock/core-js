// a write textually after the read only proves the init survives for ONE activation of the
// function holding both: call it again and the previous activation's write already landed. the
// same exposure a loop back-edge creates, one scope level up - so the reach test must bail here
// too. a write in a DIFFERENT function, or in the enclosing scope, was already caught
let M = globalThis.Map;
let R = globalThis.Reflect;
let P = globalThis.Promise;
let N = globalThis.Number;
export function sameFn() {
  const g = M.groupBy;
  M = Set;
  return g;
}
export function nestedWrite() {
  const { ownKeys: o } = R;
  if (o) { R = Math; }
  return o;
}
// straight-line module scope: the entry happens once, so the write after the read cannot precede it
const settled = P.allSettled;
P = Set;
export { settled };
// no write at all - the init is trivially live
export const integer = N.isInteger;

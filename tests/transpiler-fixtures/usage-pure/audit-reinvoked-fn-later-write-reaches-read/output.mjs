import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Set from "@core-js/pure/actual/set/constructor";
// a write textually after the read only proves the init survives for ONE activation of the
// function holding both: call it again and the previous activation's write already landed. the
// same exposure a loop back-edge creates, one scope level up - so the reach test must bail here
// too. a write in a DIFFERENT function, or in the enclosing scope, was already caught
let M = _Map;
let R = _Reflect;
let P = _Promise;
let N = _globalThis.Number;
export function sameFn() {
  const g = M.groupBy;
  M = _Set;
  return g;
}
export function nestedWrite() {
  const {
    ownKeys: o
  } = R;
  if (o) {
    R = Math;
  }
  return o;
}
// straight-line module scope: the entry happens once, so the write after the read cannot precede it
const settled = _Promise$allSettled;
P = _Set;
export { settled };
// no write at all - the init is trivially live
export const integer = _Number$isInteger;
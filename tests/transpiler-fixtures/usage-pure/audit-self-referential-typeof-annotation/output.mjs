import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a `typeof` annotation may name the very binding it annotates, directly or round a pair, and the
// annotation lane's recursion budget is the only thing that ends that loop - so it has to cross
// into the typeof resolution rather than restart there. the member row closes the same loop through
// a qualified chain, and the last row is the control: a non-circular typeof chain still narrows
// @ts-expect-error a declaration read in its own annotation is the shape under test
declare const selfRef: typeof selfRef;
export const a = _at(selfRef).call(selfRef, 0);
// @ts-expect-error a declaration read in its own annotation is the shape under test
declare const left: typeof right;
// @ts-expect-error a declaration read in its own annotation is the shape under test
declare const right: typeof left;
export const b = _at(left).call(left, 0);
declare const holder: {
  // @ts-expect-error a declaration read in its own annotation is the shape under test
  p: typeof holder.p;
};
export const c = _at(_ref = holder.p).call(_ref, 0);
// @ts-expect-error a declaration read in its own annotation is the shape under test
declare const awaitedSelf: Awaited<typeof awaitedSelf>;
export const d = _at(awaitedSelf).call(awaitedSelf, 0);
declare const source: number[];
declare const hop: typeof source;
export const e = _atMaybeArray(hop).call(hop, 0);
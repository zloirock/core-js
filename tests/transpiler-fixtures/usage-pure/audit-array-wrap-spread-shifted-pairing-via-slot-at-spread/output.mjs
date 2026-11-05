import _globalThis from "@core-js/pure/actual/global-this";
// A spread can occupy the constructor's runtime position with any element.
// The resulting WeakMap binding and construction retain their native values.
let tail = [{}, {}];
// The assignment twin retains its spread-shifted runtime constructor value.
let ax, AM, AS;
[ax, {
  Promise: AM
}] = [...tail, _globalThis];
// A spread after the first element preserves that position; its own elements remain uncertain.
const [{
  Set: C
}, {
  WeakMap: W
}] = [_globalThis, ...tail];
export const viaSlotAtSpread = new W();
import _globalThis from "@core-js/pure/actual/global-this";
// A spread after a known realm element does not shift that first element.
// Its native Set extraction and construction stay ahead of the remaining iteration.
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
export const viaSpreadAfter = new C(afterSeed);
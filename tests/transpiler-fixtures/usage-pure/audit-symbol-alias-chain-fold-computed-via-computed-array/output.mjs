import _globalThis from "@core-js/pure/actual/global-this";
// a computed key resolving to a NON-Symbol global must never fold (wrong-value guard)
const kn = 'Array';
const {
  [kn]: ComputedArray
} = _globalThis;
const {
  iterator: viaComputedArray = fb
} = ComputedArray;
export const i = [17, 18][viaComputedArray];
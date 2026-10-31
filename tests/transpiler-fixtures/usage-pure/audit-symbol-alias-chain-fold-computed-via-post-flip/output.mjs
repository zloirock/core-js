import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE (wrong-value guard): the capture reads the INIT ('Array'), so the post-capture
// flip to 'Symbol' must not fold the chain - at runtime the alias holds the Array constructor
let kd = 'Array';
const {
  [kd]: PostFlipArray
} = _globalThis;
kd = 'Symbol';
const {
  iterator: viaPostFlip = fb
} = PostFlipArray;
export const n = [25, 26][viaPostFlip];
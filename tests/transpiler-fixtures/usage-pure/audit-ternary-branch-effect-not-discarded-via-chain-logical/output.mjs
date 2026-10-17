import _globalThis from "@core-js/pure/actual/global-this";
// a chain assignment wrapping a logical fallback keeps both the write and the fallback
let c2 = Math.random() < 0.5;
let w,
  m = null;
let x2 = {
  Array: {
    from: v => v
  }
};
const {
  Array: {
    from: arrayFrom
  }
} = c2 ? w = m || _globalThis : x2;
export const viaChainLogical = arrayFrom([1, 2]);
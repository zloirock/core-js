import _Array$of from "@core-js/pure/actual/array/of";
// flat synth-swap, sequence-prefixed receiver (the prefix stays around the swap)
let e1 = 0;
export function viaParamSeq({
  of
} = (e1++, {
  of: _Array$of
})) {
  return [of, e1];
}
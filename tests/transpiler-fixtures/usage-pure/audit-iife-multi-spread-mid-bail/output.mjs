// IIFE call with mid-stream spread containing nested SpreadElement: `(...[a, ...rest])`.
// param-to-arg matching must bail on nested SpreadElement - the param index would be
// off by N when `rest` expands variadically. No synth-swap, no body-extract: caller-arg unknown
const arr = [Array];
const rest = [Object];
(({
  from
}, {
  keys
}) => [from, keys])(...[arr[0], ...rest]);
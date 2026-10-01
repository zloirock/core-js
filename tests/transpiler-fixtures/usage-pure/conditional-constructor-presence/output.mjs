import _Map from "@core-js/pure/actual/map";
// A conditional pattern alias retains the static family for a presence test.
let M;
if (true) M = _Map;
export const result = 'groupBy' in M;
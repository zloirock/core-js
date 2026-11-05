import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// Stores nested inside array sources preserve the actual container identity.
// Native groupBy and allSettled reads use full Map and Promise entries.
let cache;
export const [[{
  groupBy
}]] = [cache = [_Map]];
let kept;
export const [{
  allSettled
}] = kept = [_Promise];
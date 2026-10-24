import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a DEFAULT stands below the host's own source, so a store in it is read through as written too -
// a parameter default's own store, and a store holding the receiver itself - and the constructor
// the read lands on takes its whole entry
let cache;
export function group([{
  groupBy
}] = cache = [_Map]) {
  return groupBy;
}
let kept;
export const {
  C: {
    allSettled
  } = kept = _Promise
} = {};
import _Promise from "@core-js/pure/actual/promise";
// A chain assignment makes the wrapper hold its latest array value.
// The native allSettled read keeps the Promise source supplied by that write.
let wrap = [Object],
  w2;
wrap = w2 = [_Promise];
const [{
  allSettled
}] = wrap;
export const wrapperAlias = allSettled.call(_Promise, []);
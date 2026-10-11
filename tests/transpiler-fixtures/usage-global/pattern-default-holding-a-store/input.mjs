// a store in a default - a parameter default's own one, or one holding the receiver itself - reads
// the static the stored value holds, as a store-free default does
let cache;
export function group([{ groupBy }] = (cache = [Map])) {
  return groupBy;
}

let kept;
export const { C: { allSettled } = (kept = Promise) } = {};

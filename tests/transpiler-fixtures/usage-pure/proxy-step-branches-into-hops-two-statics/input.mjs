// A pristine proxy step descends into EVERY hop under it, each hop carrying its own key path; the drain merges them back under the
// step they share - a repeated step key nests rather than repeating itself - and counts the branch's arity in OUTER props, one of
// which may cover several hops at once.
const userRoot = { self: { Map: { groupBy: () => 'U' }, Array: { prototype: { at: () => 'U' } } } };
export function twoStatics(flag) {
  let gb, of;
  ({ self: { Map: { groupBy: gb }, Array: { of } } } = flag ? userRoot : globalThis);
  return [gb, of];
}

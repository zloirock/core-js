import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// NEGATIVE: no live optional over the hop - the emit SWALLOWS the receiver instead of keeping it
// in a test, and the buried global goes with it
export const swallowedReceiver = _Map$groupBy([1], x => x);
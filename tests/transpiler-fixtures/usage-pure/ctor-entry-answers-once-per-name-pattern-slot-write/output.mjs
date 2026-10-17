import _WeakMap from "@core-js/pure/actual/weak-map";
export function patternSlotWrite(mk) {
  const W = _WeakMap;
  mk(W);
  return new _WeakMap();
}
export function patternSlotWrite(mk) {
  const { WeakMap: W } = globalThis;
  mk(W);
  return new WeakMap();
}

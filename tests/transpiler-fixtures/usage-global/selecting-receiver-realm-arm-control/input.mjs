function realm() { return globalThis; }
function opaque() { return { Array: { of() { return 'custom'; } } }; }
// A constructor with a pure entry keeps its statics: the read off the selection is a held slot.
export function ctorStatic(flag) {
  return (flag ? realm() : opaque()).Map.groupBy([1, 2], value => value % 2);
}

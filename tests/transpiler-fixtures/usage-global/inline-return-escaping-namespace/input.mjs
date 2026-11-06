// Exporting the subclass exposes every static of its possible base, so every returned constructor
// escapes: `Map` loads its whole family, while `Array`, a native constructor with no entry of its
// own, loads nothing.
export class ArrayChild extends (() => {
  if (flag) return Array;
  return customArray;
})() {}
export class MapChild extends (() => {
  if (flag) return Map;
  return customMap;
})() {}

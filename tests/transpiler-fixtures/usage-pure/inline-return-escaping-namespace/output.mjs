import _Map from "@core-js/pure/actual/map";
// Exporting the subclass exposes every static of its possible base.
// Every returned namespace escapes here, including native constructors without a binding entry.
export class ArrayChild extends (() => {
  if (flag) return Array;
  return customArray;
})() {}
export class MapChild extends (() => {
  if (flag) return _Map;
  return customMap;
})() {}
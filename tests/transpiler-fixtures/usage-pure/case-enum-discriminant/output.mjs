import _Map$groupBy from "@core-js/pure/actual/map/group-by";
export function read() {
  switch (typeof _Map$groupBy) {
    case 'function':
      enum Map {
        None = 0
      }
      return Map.None;
    default:
      return -1;
  }
}
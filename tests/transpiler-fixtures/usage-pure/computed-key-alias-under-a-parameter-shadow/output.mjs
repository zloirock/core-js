import _Map from "@core-js/pure/actual/map";
// A parameter owns its key alias even when an outer namesake holds an intrinsic property.
// Its runtime key remains unknown, so a replaced constructor needs its static namespace.
const key = 'name';
export function read(key) {
  const alias = key;
  return _Map[alias]([1, 2, 3], value => value % 2);
}
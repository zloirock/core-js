import _Map from "@core-js/pure/actual/map";
// The loop keeps the call result opaque to static extraction. Its actual member read still
// needs the possible Map namespace, even though the constructor itself stays local.
export const value = (() => {
  while (flag) return _Map;
  return custom;
})().groupBy([1, 2, 3], value => value % 2);
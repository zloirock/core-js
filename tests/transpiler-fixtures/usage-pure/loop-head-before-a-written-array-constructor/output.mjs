import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
export function read(flag) {
  const box = {
    C: _Map
  };
  if (flag) box.C = _Set;
  let methods;
  for (const {
    of,
    groupBy
  } of [box.C]) methods = [of, groupBy];
  box.C = Array;
  return methods;
}
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// A positional pattern keeps its native read of a reassigned constructor.
// No identity guard serves that read, so the constructor must carry the static.
function read(flag) {
  let M = _Map;
  if (flag) M = _Set;
  const [{
    groupBy
  }] = [M];
  return groupBy([1, 2], value => value % 2).get(1)[0];
}
export const r = read(false);
import _Map from "@core-js/pure/actual/map";
// A parameter pattern keeps the default behind an opaque computed key.
// Its substituted constructor must carry the static.
function read({
  [String(Math.random())]: {
    groupBy
  } = _Map
}) {
  return groupBy([1], value => value).get(1)[0];
}
export const r = read({});
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// The inner default supplies Map.groupBy. A caller can supply both properties.
function f({
  a: {
    b: {
      entries,
      groupBy
    } = {
      entries: _Map.entries,
      groupBy: _Map$groupBy
    }
  } = {
    b: undefined
  }
} = {
  a: undefined
}) {
  return [entries, groupBy];
}
export { f };
export const groups = f()[1]([3], x => x).get(3);
export const supplied = f({
  a: {
    b: {
      entries: 1,
      groupBy: 2
    }
  }
});
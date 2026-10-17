import _Object$groupBy from "@core-js/pure/actual/object/group-by";
export function groupedInFunction() {
  let held;
  {
    const Map = Object;
    held = Map;
  }
  return _Object$groupBy([1, 2], it => it % 2);
}
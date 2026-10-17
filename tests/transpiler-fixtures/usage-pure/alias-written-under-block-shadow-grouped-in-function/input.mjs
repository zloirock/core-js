export function groupedInFunction() {
  let held;
  {
    const Map = Object;
    held = Map;
  }
  return held.groupBy([1, 2], it => it % 2);
}

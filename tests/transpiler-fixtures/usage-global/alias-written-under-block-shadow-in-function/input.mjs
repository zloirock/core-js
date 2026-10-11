// In usage-global a receiver alias written under a block shadow inside a function reads as the value
// the write saw: `Object`, so the `groupBy` it calls injects `es.object.group-by` - read where the
// call stands instead, the alias named the outer `Map` and its `groupBy` alone
export function groupedInFunction() {
  let held;
  {
    const Map = Object;
    held = Map;
  }
  return held.groupBy([1, 2], it => it % 2);
}

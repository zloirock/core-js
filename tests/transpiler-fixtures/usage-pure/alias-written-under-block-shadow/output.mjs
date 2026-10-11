import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// an alias written under a block that rebinds the name its value reads holds what the write saw: the
// receiver, the container slot, the static source a destructure reads and the realm a navigation
// starts from all resolve where the write stands - `Object`, which `groupBy` claims from and which
// serves no `from`, so those reads stay native. a block that rebinds nothing leaves the global
let viaClosure;
{
  const Map = Object;
  viaClosure = Map;
}
export const groupedViaClosure = () => _Object$groupBy([1, 2], it => it % 2);
export function groupedInFunction() {
  let held;
  {
    const Map = Object;
    held = Map;
  }
  return _Object$groupBy([1, 2], it => it % 2);
}
let box;
{
  const Map = Object;
  box = {
    M: Map
  };
}
export const groupedViaContainer = () => _Object$groupBy([1, 2], it => it % 2);
let source;
{
  const Array = Object;
  source = Array;
}
export const destructured = () => {
  const {
    from
  } = source;
  return from;
};
let realm;
{
  const globalThis = {
    Array: Object
  };
  realm = globalThis;
}
export const fromRealm = () => realm.Array.from;
let unshadowed;
{
  unshadowed = _Map;
}
export const groupedUnshadowed = () => _Map$groupBy([1, 2], it => it % 2);
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
let unshadowed;
{
  unshadowed = _Map;
}
export const groupedUnshadowed = () => _Map$groupBy([1, 2], it => it % 2);
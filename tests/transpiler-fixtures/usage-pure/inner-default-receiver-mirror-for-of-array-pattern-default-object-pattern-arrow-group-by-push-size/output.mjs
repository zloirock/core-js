import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
for (const [{
  groupBy
} = {
  groupBy: _Map$groupBy
}] of [[undefined]]) (_pushMaybeArray(out) || 0).call(out, groupBy([1, 2], x => x % 2).size);
export { out };
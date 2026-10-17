import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
for (const [{
  from
} = {
  from: _Array$from
}, tail] of [[undefined, 1], [{
  from: _Array$from
}, 2]]) (_pushMaybeArray(out) || 0).call(out, from([1]).length + tail);
export { out };
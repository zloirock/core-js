import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const seen = [];
// a bodyless head: the extraction has to build the block it puts the residual in
for (const {
  at,
  ...rest
} of [rows]) (_pushMaybeArray(seen) || 0).call(seen, typeof at, 'at' in rest);
export { seen };
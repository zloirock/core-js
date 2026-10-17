import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const seen = [];
for (const {
  at,
  ...rest
} of [rows]) {
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.at(0));
}
export { seen };
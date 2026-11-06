import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const seen = [];
// a nested leaf beside a SIBLING relocates too: what it buys is the declaration host, and the
// sibling rides along in the residual reading the same memo
for (const _ref2 of [{
  y: rows,
  keep: 5
}]) {
  const {
      y: _ref
    } = _ref2,
    viaSibling = _atMaybeArray(_ref),
    {
      keep
    } = _ref;
  _pushMaybeArray(seen).call(seen, typeof viaSibling, keep);
}
export { seen };
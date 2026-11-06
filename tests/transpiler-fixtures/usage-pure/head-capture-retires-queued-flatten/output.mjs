import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a static beside a nested instance leaf over a loop-head binding: the leaf's flatten takes the
// nested level, so the static extracts flat beside it on both legs - the pair renders once, never a
// second copy beside a capture (a duplicate declaration and a dangling ref)
const out = [];
for (const R of [Array]) {
  const _ref = R.prototype;
  const at = _atMaybeArray(_ref);
  const {
    length
  } = _ref;
  const from = _Array$from;
  _pushMaybeArray(out).call(out, at, length, from);
}
export { out };
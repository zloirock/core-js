import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Both leaves of a nested prototype head use the same array receiver type.
// Moving the head into the body retains the whole element separately from each leaf.
for (const _ref of [{
  w: Array
}]) {
  const _ref2 = _ref.w.prototype;
  const at = _atMaybeArray(_ref2);
  const includes = _includesMaybeArray(_ref2);
  use(at, includes);
}
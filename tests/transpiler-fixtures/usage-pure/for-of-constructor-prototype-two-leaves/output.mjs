import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Both leaves of a nested prototype head use the same array receiver type.
// Moving the head into the body retains the whole element separately from each leaf.
for (const _ref2 of [{
  w: Array
}]) {
  const {
      w: {
        prototype: _ref
      }
    } = _ref2,
    at = _atMaybeArray(_ref),
    includes = _includesMaybeArray(_ref);
  use(at, includes);
}
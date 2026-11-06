import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Relocating a loop head preserves a native static beside an instance claim.
let from, at;
for (const _ref of [{
  C: Array,
  values: [1]
}]) {
  ({
    C: {
      from
    }
  } = _ref);
  at = _atMaybeArray(_ref.values);
  use(from, at);
}
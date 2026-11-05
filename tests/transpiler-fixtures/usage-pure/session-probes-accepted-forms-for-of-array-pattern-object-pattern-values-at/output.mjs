import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A for-of array head keeps its native Object.values read beside a captured array at leaf.
// Both bindings retain their original element positions.
{
  for (const _ref2 of [[Object, [1]]]) {
    const [{
      values
    }, _ref] = _ref2;
    const at = _atMaybeArray(_ref);
    [values, at];
  }
}
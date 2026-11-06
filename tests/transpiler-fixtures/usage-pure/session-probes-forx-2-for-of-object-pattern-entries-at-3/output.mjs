import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A literal-object loop head retains native entries beside the served array at leaf.
{
  for (const _ref of [{
    w: Object,
    y: [1]
  }]) {
    const {
      w: {
        entries
      }
    } = _ref;
    const at = _atMaybeArray(_ref.y);
    [entries, at];
  }
}
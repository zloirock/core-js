import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A literal object keeps its native Object.values read beside an array at capture.
{
  const _ref = {
    w: Object,
    y: [1]
  };
  const {
    w: {
      values
    }
  } = _ref;
  const at = _atMaybeArray(_ref.y);
  [values, at];
}
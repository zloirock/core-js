import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$values from "@core-js/pure/actual/object/values";
{
  const _ref = {
    w: {
      values: _Object$values
    },
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
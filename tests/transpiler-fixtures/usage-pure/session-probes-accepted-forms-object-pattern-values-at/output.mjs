import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
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
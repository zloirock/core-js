import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const arr = [1, [2]];
const _ref = {
  x: Array,
  y: arr
};
const {
  x: {
    from: f
  }
} = _ref;
const m = _flatMaybeArray(_ref.y);
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const wrapper = {
  Array,
  other: 1
};
let from, other;
({
  Array: {
    from
  },
  other
} = (log(), wrapper));
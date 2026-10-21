// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
function eff() {
  return Object;
}
{
  const {
    [(eff('k'), 'w')]: {
      from: f4b
    },
    z
  } = {
    w: Array,
    z: 1
  };
}
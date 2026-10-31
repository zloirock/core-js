// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const forInKeysLeakNothing = function () {
  const inBox = {
    k: Object
  };
  let last;
  for (const key in inBox) last = key;
  void last;
  const {
    k: {
      defineProperty
    }
  } = inBox;
  return defineProperty;
}();
export { forInKeysLeakNothing };
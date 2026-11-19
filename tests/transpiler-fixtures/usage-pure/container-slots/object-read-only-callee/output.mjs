// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const readOnlyCallee = function () {
  function onlyReads(t) {
    return t.k;
  }
  const readOnlyEscape = {
    k: Object
  };
  onlyReads(readOnlyEscape);
  const {
    k: {
      entries
    }
  } = readOnlyEscape;
  return entries;
}();
export { readOnlyCallee };
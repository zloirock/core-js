// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const switchDiscriminantLeaksNothing = (function () {
  const switchBox = { k: Object };
  switch (switchBox) { default: break; }
  const { k: { seal: viaSwitch } } = switchBox;
  return viaSwitch;
})();
export { switchDiscriminantLeaksNothing };

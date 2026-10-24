import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const k = 'k';
{
  const k = 'w';
  let m;
  ({
    [k]: {
      Map: m
    }
  } = {
    w: _globalThis
  });
  use(m);
}
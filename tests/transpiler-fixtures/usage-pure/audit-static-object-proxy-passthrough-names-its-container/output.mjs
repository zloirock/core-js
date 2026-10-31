import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const w = {
  g: _globalThis
};
function read({
  g: {
    Set,
    other
  }
} = w) {
  return [new Set(), other];
}
function readInline({
  g: {
    Set,
    other
  }
} = {
  g: _globalThis
}) {
  return [new Set(), other];
}
export const out = [read(), readInline()];
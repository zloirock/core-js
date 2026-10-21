// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const w = { g: globalThis };
function read({ g: { Set, other } } = w) {
  return [new Set(), other];
}
function readInline({ g: { Set, other } } = { g: globalThis }) {
  return [new Set(), other];
}
export const out = [read(), readInline()];

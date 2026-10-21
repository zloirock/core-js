// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
let a;
const [{
  from
}] = [(a = globalThis).Array];

// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
export function read(flag, user) {
  const [{ from, at }] = [flag ? Array : user];
  return [from, at];
}

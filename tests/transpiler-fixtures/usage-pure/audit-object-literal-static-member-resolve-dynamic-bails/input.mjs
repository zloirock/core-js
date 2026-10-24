// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
const clean = { S: Iterator };
const { S: { from } } = clean;
export function dynamicBails(o) {
  const ns = { P: Array, [o.k]: Iterator };
  const { P: { from } } = ns;
  return from([1, 2]);
}

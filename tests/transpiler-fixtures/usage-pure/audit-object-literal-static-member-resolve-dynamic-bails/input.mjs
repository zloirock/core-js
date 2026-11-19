// An unknown computed key can replace a literal slot, so its statics dispatch on the stored constructor.
// The clean Iterator container retains the full constructor and native property read.
const clean = { S: Iterator };
const { S: { from } } = clean;
export function dynamicBails(o) {
  const ns = { P: Array, [o.k]: Iterator };
  const { P: { from } } = ns;
  return from([1, 2]);
}

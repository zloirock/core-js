// An unknown computed key may replace the slot; dispatch on the stored constructor.
const clean = { S: Iterator };
const { S: { from } } = clean;
export function dynamicBails(o) {
  const ns = { P: Array, [o.k]: Iterator };
  const { P: { from } } = ns;
  return from([1, 2]);
}

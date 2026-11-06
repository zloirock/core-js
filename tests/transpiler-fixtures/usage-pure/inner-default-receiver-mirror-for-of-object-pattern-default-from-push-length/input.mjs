// An absent keyed loop slot evaluates its Array default; a present one uses its own value.
// The from extraction stays within each iteration.
const out = [];
for (const { k: { from } = Array } of [{}, { k: Array }]) out.push(from([1]).length);
export { out };

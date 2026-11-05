// An explicitly undefined keyed loop slot uses Array while a defined slot keeps its supplied value.
// Both routes preserve the served from claim.
const out = [];
for (const { k: { from } = Array } of [{ k: undefined }, { k: Array }]) out.push(from([1]).length);
export { out };

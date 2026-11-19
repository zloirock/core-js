// A gap TRAILING the last hop only: the boundary reads before `?.` see no gap here, and the
// end-of-chain comment must neither confuse the needle nor survive into a wrong slot.
const p = { q: { r: [[5], [6]] } };
p.q?.r.slice(1).flat(0) /* tail */;

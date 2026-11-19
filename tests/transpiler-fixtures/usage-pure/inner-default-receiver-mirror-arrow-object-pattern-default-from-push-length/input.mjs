// An inner parameter default selects Array only when its keyed slot is absent.
// The served from leaf preserves both supplied and defaulted receiver paths.
const out = [];
(({ k: { from } = Array }) => out.push(from([1]).length))({ k: Array });
export { out };

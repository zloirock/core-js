// One alias binding feeds three narrowing queries with different return-type shapes
// (iterator, element, array) in the same traversal pass.
// Verifies the alias-narrow context stays stable across multiple visitor invocations.
const fromAlias = Array.from;
const seq = fromAlias('abc');
const it = seq.entries();
const last = seq.findLast(x => x === 'b');
const part = seq.slice(0, 2);
export { it, last, part };

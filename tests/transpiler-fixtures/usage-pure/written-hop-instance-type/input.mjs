// a member chain past a HOP the file wrote reads the written container, not the literal the hop held,
// and a getter's fresh literal a binding holds is that binding's container: an instance method on
// either dispatches generically in pure and injects every family in usage-global
const box = { k: { a: [1, 2] } };
box.k = { a: 'ab' };
export const last = box.k.a.at(-1);
const source = { get fresh() { return { b: [1, 2] }; } };
const held = source.fresh;
held.b = 'cd';
export const has = held.b.includes('d');

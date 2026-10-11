// a constructor written through a selection lands on every container its arms spell at any depth - an arm
// that is itself a selection or a logical fallback included - so a static read back through a nested arm owes
// the written constructor's family
const a = { C: Object };
const b = { C: Object };
const c = { C: Object };
const picked = flag ? (other ? b : c) : a;
picked.C = Map;
export const grouped = b.C.groupBy([1], x => x);
const d = { C: Object };
const e = { C: Object };
const f = { C: Object };
const chosen = flag ? d : other ? e : f;
chosen.C = Promise;
export const settled = f.C.allSettled([]);
const g = { C: Object };
const h = { C: Object };
const i = { C: Object };
const fallen = flag ? g : (h || i);
fallen.C = Symbol;
export const registered = i.C.for('a');

// usage-global twin of the pure SE-key memo hosts (export + live default, sibling declarators,
// exported flatten with a later-declarator memo, SE-bearing computed-member receiver beside a
// flatten sibling): the global method never rewrites these destructures, so the lock here is the
// import set alone - one method family per line, and the SE-key row reads a carrier of a DIFFERENT
// family than its neighbours, or the family it pulls whole would answer for every line at once
var bag = { A: Map };
var e = 0;
const { groupBy: m1 } = bag[(e++, 'A')], { Array: { of: of1 } } = globalThis;
console.log(m1, of1, e);
export const { [(se1(), 'with')]: w = dflt(), [(se2(), 'toSpliced')]: t } = [9];
let k = 0;
var { [(k++, 'at')]: a, other } = [7, 8], z = 1;
for (var { [(k++, 'flat')]: f, other2 } = [[1], 2], i = 0; i < 1; i++) console.log(f);
export const { Array: { isArray } } = globalThis, { [(k++, 'includes')]: inc } = holder.p;
console.log(w, t, a, z, inc, k, other, other2, isArray);

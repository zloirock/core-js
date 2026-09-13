// Computed-key instance patterns read their member receiver once, then evaluate each key
// before its method read and subsequent siblings. Declarator and for-init hosts preserve
// the source slot, and an effectful sibling initializer runs before nested extraction.
const logv = [];
const holder = { p: [1, [2]] };
var { [(logv.push(1), 'flat')]: m, other } = holder.p;
export const r1 = [typeof m, typeof other, logv.length];
var x = 1, { [(logv.push(2), 'at')]: a2, rest } = holder.p;
export const r2 = [typeof a2, typeof rest, x];
let out;
for (var { [(logv.push(3), 'includes')]: inc, tail } = holder.p; !out;) {
  out = typeof inc;
}
export const r3 = [out, typeof tail];
var { [(logv.push(4), 'flatMap')]: fm } = holder.p;
export const r4 = [typeof fm, logv.length];
const eff = [];
const { q: qq, p: { [(eff.push('key'), 'flat')]: m2, other2 } } = { q: (eff.push('se'), 1), p: holder.p };
export const r5 = [typeof m2, typeof other2, qq, eff.join(',')];

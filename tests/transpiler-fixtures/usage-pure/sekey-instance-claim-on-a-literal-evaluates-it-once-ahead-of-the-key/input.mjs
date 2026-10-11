// an effectful computed key over an instance claim on a literal receiver: the literal is evaluated once,
// ahead of the key, and the dispatch reads that memo - beside a sibling declarator on either side, in a
// for or if head, and under an export, which exposes only the source bindings
let k = 0;
var t1 = 0, { [(k++, 'at')]: a1 } = [1];
var { [(k++, 'at')]: a2 } = [1], t2 = 0;
var t3 = 0, { [(k++, 'at')]: a3, other3 } = [1];
for (var t4 = 0, { [(k++, 'at')]: a4 } = [1]; false;) break;
if (k) var t5 = 0, { [(k++, 'at')]: a5 } = [1];
export const t6 = 0, { [(k++, 'at')]: a6 } = [1];
export default [a1, a2, a3, other3, a4, a5, t1, t2, t3, t4, t5, k];

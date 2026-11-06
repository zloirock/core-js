// an instance read under an effectful computed key captures its receiver where the source evaluates it, in
// every host - a nested level, a sole property, a for-init, an opaque call, an effectful computed member,
// an optional call - so each effect runs once, ahead of the key and the sibling reads; a rest beside the
// key keeps the whole pattern native
let k6 = 0;
const { y: { [(k6++, 'values')]: v6 }, z6 } = { y: Promise.prototype ? [1] : [], z6: 1 };
export const r6 = [typeof v6, k6, z6];
let k7 = 0;
var { [(k7++, 'keys')]: ks7 } = Promise.prototype ? [9] : [];
export const r7 = [typeof ks7, k7];
let k8 = 0, out8 = '';
for (var { [(k8++, 'entries')]: e8, other8 } = 1 ? [6] : [], i8 = 0; i8 < 1; i8++) out8 = typeof e8;
export const r8 = [out8, k8];
let k9 = 0, calls9 = 0;
function mk9() { calls9++; return [9]; }
var { [(k9++, 'at')]: a9, other9 } = mk9();
export const r9 = [typeof a9, k9, calls9];
let g12 = 0;
const holder12 = { get p() { g12++; return [3]; } };
var { [(g12++, 'findLast')]: fl12, other12 } = holder12[(g12++, 'p')];
export const r12 = [typeof fl12, g12];
let k13 = 0;
function mk13() { return [7, 8]; }
var { [(k13++, 'includes')]: a13, ...rest13 } = mk13();
export const r13 = [typeof a13, k13, typeof rest13];
let k14 = 0;
const holder14 = { get14() { return [4]; } };
var { [(k14++, 'flat')]: f14, other14 } = holder14?.get14?.();
export const r14 = [typeof f14, k14];

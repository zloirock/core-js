// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let k1 = 0;
var { [(k1++, 'at')]: a1, other1 } = Promise.prototype ? [7, 8] : [];
export const r1 = [typeof a1, k1];
// logical `||` receiver
let k2 = 0;
const arr2 = [1];
var { [(k2++, 'flat')]: f2, other2 } = arr2 || [];
export const r2 = [typeof f2, k2];
// logical `??` receiver
let k3 = 0;
const arr3 = [2];
var { [(k3++, 'includes')]: inc3, other3 } = arr3 ?? [];
export const r3 = [typeof inc3, k3];
// logical `&&` receiver
let k4 = 0;
const arr4 = [3], arr5 = [4];
var { [(k4++, 'findLast')]: fl4, other4 } = arr4 && arr5;
export const r4 = [typeof fl4, k4];
// diverging ternary (user-object branch): Maybe-dispatch keeps the user branch value-correct
let k5 = 0;
const userObj = { flatMap: undefined };
function pick(c) {
  var { [(k5++, 'flatMap')]: fm, other5 } = c ? [5] : userObj;
  return typeof fm;
}
export const r5 = [pick(true), pick(false), k5];
// A nested branching receiver keeps its selected slot ahead of the key and sibling read.
let k6 = 0;
const { y: { [(k6++, 'values')]: v6 }, z6 } = { y: Promise.prototype ? [1] : [], z6: 1 };
export const r6 = [typeof v6, k6, z6];
// A sole property also captures its RHS before the key effect and reads the method once.
let k7 = 0;
var { [(k7++, 'keys')]: ks7 } = Promise.prototype ? [9] : [];
export const r7 = [typeof ks7, k7];
// A for-init declaration captures its receiver before the key and later declarators.
let k8 = 0, out8 = '';
for (var { [(k8++, 'entries')]: e8, other8 } = 1 ? [6] : [], i8 = 0; i8 < 1; i8++) out8 = typeof e8;
export const r8 = [out8, k8];
// An opaque initializer is captured where the source evaluates it, so each buried effect
// runs once before the key and property reads.
let k9 = 0, calls9 = 0;
function mk9() { calls9++; return [9]; }
var { [(k9++, 'at')]: a9, other9 } = mk9();
export const r9 = [typeof a9, k9, calls9];
// SE-bearing ternary (an effectful branch value)
let k10 = 0;
var { [(k10++, 'flat')]: f10, other10 } = k10 >= 0 ? Array.of([1]) : [];
export const r10 = [typeof f10, k10];
// A sequence initializer retains its effectful prefix and selected receiver together.
let k11 = 0, s11 = 0;
var { [(k11++, 'includes')]: inc11, other11 } = (s11++, s11 > 0 ? Array.of(2) : []);
export const r11 = [typeof inc11, k11, s11];
// effectful computed-member receiver (getter + key effect each fire once)
let g12 = 0;
const holder12 = { get p() { g12++; return [3]; } };
var { [(g12++, 'findLast')]: fl12, other12 } = holder12[(g12++, 'p')];
export const r12 = [typeof fl12, g12];
let k13 = 0;
function mk13() { return [7, 8]; }
var { [(k13++, 'at')]: a13, ...rest13 } = mk13();
export const r13 = [typeof a13, k13, typeof rest13];
// An optional-call initializer is evaluated once before the pattern starts reading it.
let k14 = 0;
const holder14 = { get14() { return [4]; } };
var { [(k14++, 'flat')]: f14, other14 } = holder14?.get14?.();
export const r14 = [typeof f14, k14];
// Proxy navigation collapses inside the captured receiver before its instance read.
let k15 = 0;
var { [(k15++, 'at')]: a15, other15 } = globalThis['self'].Array.prototype;
export const r15 = [typeof a15, k15];
// An effectful sequence prefix stays with the captured navigation receiver and runs once.
let k16 = 0, s16 = 0;
var { [(k16++, 'flat')]: f16, other16 } = (s16++, globalThis.self.Array.prototype);
export const r16 = [typeof f16, k16, s16];
// An exported pattern exposes only its source bindings; generated receiver names stay private.
let k17 = 0;
export var { [(k17++, 'toSorted')]: _u17, other17 } = holder17.p;
export const r17 = [typeof _u17, typeof other17, k17];
// A multi-declarator export preserves binding order and exposes only the source names.
let k18 = 0;
export var { [(k18++, 'values')]: _u18, other18 } = holder18.p, z18 = 1;
export const r18 = [typeof _u18, typeof other18, z18, k18];
// A later exported pattern keeps its receiver read after earlier initializers without
// exporting the generated receiver name.
let k19 = 0;
export var z19 = 1, { [(k19++, 'keys')]: _u19, other19 } = holder19.p;
export const r19 = [z19, typeof other19, k19];

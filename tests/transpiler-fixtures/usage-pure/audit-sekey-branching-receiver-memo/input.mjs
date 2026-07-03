// a side-effect-key instance destructure off a side-effect-free BRANCHING receiver (ternary /
// logical) memoizes the receiver into a `_ref` read once - the branch selects exactly once,
// like the native single read - and extracts the polyfill off the memo. the key effect stays
// in the kept residual key (runs once); Maybe-dispatch keeps a diverging branch value-correct
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
// nested branching fragment off a pure init hoists the fragment memo
let k6 = 0;
const { y: { [(k6++, 'values')]: v6 }, z6 } = { y: Promise.prototype ? [1] : [], z6: 1 };
export const r6 = [typeof v6, k6, z6];
// sole-prop pattern memoizes too: the kept key effect still reads the residual, so the
// receiver has two readers (residual + extract) and the memo is the only sound single-read
let k7 = 0;
var { [(k7++, 'keys')]: ks7 } = Promise.prototype ? [9] : [];
export const r7 = [typeof ks7, k7];
// for-init sibling-declarator host takes the memo as a preceding declarator
let k8 = 0, out8 = '';
for (var { [(k8++, 'entries')]: e8, other8 } = 1 ? [6] : [], i8 = 0; i8 < 1; i8++) out8 = typeof e8;
export const r8 = [out8, k8];
// the memoize channel also takes the WHOLE INIT of a top-level multi-prop pattern when the
// receiver resolves to no single-read-safe node - the memo evaluates exactly where the init
// did, so every buried effect runs once in source order, whatever the expression shape
let k9 = 0, calls9 = 0;
function mk9() { calls9++; return [9]; }
var { [(k9++, 'at')]: a9, other9 } = mk9();
export const r9 = [typeof a9, k9, calls9];
// SE-bearing ternary (an effectful branch value)
let k10 = 0;
var { [(k10++, 'flat')]: f10, other10 } = k10 >= 0 ? Array.of([1]) : [];
export const r10 = [typeof f10, k10];
// sequence init with an SE-bearing tail: the memo captures the WHOLE sequence (prefix included)
let k11 = 0, s11 = 0;
var { [(k11++, 'includes')]: inc11, other11 } = (s11++, s11 > 0 ? Array.of(2) : []);
export const r11 = [typeof inc11, k11, s11];
// effectful computed-member receiver (getter + key effect each fire once)
let g12 = 0;
const holder12 = { get p() { g12++; return [3]; } };
var { [(g12++, 'findLast')]: fl12, other12 } = holder12[(g12++, 'p')];
export const r12 = [typeof fl12, g12];
// rest sibling: the kept (renamed) key is read and EXCLUDED from rest like native
let k13 = 0;
function mk13() { return [7, 8]; }
var { [(k13++, 'at')]: a13, ...rest13 } = mk13();
export const r13 = [typeof a13, k13, typeof rest13];
// optional-call init routes through the same whole-init memo
let k14 = 0;
const holder14 = { get14() { return [4]; } };
var { [(k14++, 'flat')]: f14, other14 } = holder14?.get14?.();
export const r14 = [typeof f14, k14];
// a proxy-hop member receiver collapses INSIDE the memo (the raw hop is undefined off-engine)
let k15 = 0;
var { [(k15++, 'at')]: a15, other15 } = globalThis['self'].Array.prototype;
export const r15 = [typeof a15, k15];
// a sequence init whose resolved TAIL sits under an impure prefix retries as the whole init:
// the memo captures prefix and receiver together, effects once in source order
let k16 = 0, s16 = 0;
var { [(k16++, 'flat')]: f16, other16 } = (s16++, globalThis.self.Array.prototype);
export const r16 = [typeof f16, k16, s16];

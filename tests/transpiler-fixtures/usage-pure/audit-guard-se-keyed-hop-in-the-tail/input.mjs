// Effectful realm keys retain guard, read and delete order. Non-realm computed tails stay live.
let seK = 0;
globalThis.seKeyHost = { w: { c: 1 } };
const sk2 = () => globalThis;
export const seKeyThenPlainTail = sk2()?.window?.[(seK++, 'self')].seKeyHost.w.c;
export const seKeyDeleteTail = delete sk2()?.window?.[(seK++, 'self')].seKeyHost.w.c;
export { seK };
let ck2 = 0;
globalThis.ckHost = { a: 1 };
const ckr = () => globalThis;
export const opaqueComputedKeyTail = ckr()?.window?.[(ck2++, 'self')]?.window?.[(ck2++, 'ckHost')]?.a;
export const opaqueComputedKeyPlain = ckr()?.window?.self[(ck2++, 'ckHost')].a;
export { ck2 };

// an effect-keyed hop migrating into the guard wraps the binding alone, so the tail reads off its
// value with the sequence closed before it (`(se, _self).tail`), in a read and in a `delete`, and the
// key runs once, on the guarded branch. an effect-keyed hop past the landing keeps its own span: the
// fold stops there in both emitters, so that key runs once too.
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

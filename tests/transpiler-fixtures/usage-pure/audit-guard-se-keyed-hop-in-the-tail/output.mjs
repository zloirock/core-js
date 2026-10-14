import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an effect-keyed hop migrating into the guard wraps the binding alone, so the tail reads off its
// value with the sequence closed before it (`(se, _self).tail`), in a read and in a `delete`, and the
// key runs once, on the guarded branch. an effect-keyed hop past the landing keeps its own span: the
// fold stops there in both emitters, so that key runs once too.
let seK = 0;
_globalThis.seKeyHost = {
  w: {
    c: 1
  }
};
const sk2 = () => _globalThis;
export const seKeyThenPlainTail = null == sk2().window ? void 0 : (seK++, _self).seKeyHost.w.c;
export const seKeyDeleteTail = null == sk2().window ? true : delete (seK++, _self).seKeyHost.w.c;
export { seK };
let ck2 = 0;
_globalThis.ckHost = {
  a: 1
};
const ckr = () => _globalThis;
export const opaqueComputedKeyTail = (null == ckr().window ? void 0 : (ck2++, _self).window)?.[ck2++, 'ckHost']?.a;
export const opaqueComputedKeyPlain = null == ckr().window ? void 0 : _self[ck2++, 'ckHost'].a;
export { ck2 };
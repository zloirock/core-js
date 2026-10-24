import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Effectful realm keys retain guard, read and delete order. Non-realm computed tails stay live.
let seK = 0;
_globalThis.seKeyHost = {
  w: {
    c: 1
  }
};
const sk2 = () => _globalThis;
export const seKeyThenPlainTail = sk2()?.window?.[seK++, 'self'].seKeyHost.w.c;
export const seKeyDeleteTail = delete sk2()?.window?.[seK++, 'self'].seKeyHost.w.c;
export { seK };
let ck2 = 0;
_globalThis.ckHost = {
  a: 1
};
const ckr = () => _globalThis;
export const opaqueComputedKeyTail = ckr()?.window?.[ck2++, 'self']?.window?.[ck2++, 'ckHost']?.a;
export const opaqueComputedKeyPlain = null == ckr().window ? void 0 : _self[ck2++, 'ckHost'].a;
export { ck2 };
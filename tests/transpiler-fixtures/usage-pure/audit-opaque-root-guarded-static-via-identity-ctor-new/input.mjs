// a CTOR read through the guarded identity chain: the guard tests the window prefix, both
// legs construct the ponyfill (`new _Map`) - the arrow-paren reprint differs cosmetically
export const viaIdentityCtorNew = ((x) => x)(globalThis)?.window?.Map && new (((x) => x)(globalThis)).Map([[1, 2]]).size;

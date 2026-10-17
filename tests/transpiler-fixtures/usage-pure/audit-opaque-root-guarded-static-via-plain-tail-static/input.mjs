// a PLAIN (non-optional) ponyfillable tail hop collapses with the branch - only the optional
// window hop is a source of undefined
const pt = () => globalThis;
export const viaPlainTailStatic = pt()?.window?.self.Array.of(22).at(0);

// a leaf core-js ponyfills no constructor for has no binding to stand in as the always-defined
// alternate, so the guard reads off the global's own name - the claim beside it still polyfills
export const unponyfilledCtorLeaf = (globalThis.window?.Array).of(1);

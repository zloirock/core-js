import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a leaf core-js ponyfills no constructor for has no binding to stand in as the always-defined
// alternate, so the guard reads off the global's own name - the claim beside it still polyfills
export const unponyfilledCtorLeaf = ((null == _globalThis.window ? void 0 : Array).of, _Array$of)(1);
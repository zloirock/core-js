import _Symbol from "@core-js/pure/actual/symbol/constructor";
// cyclic alias through computed key must terminate via seen-guard (distinct code path
// from resolveBindingToGlobal's receiver-chain guard)
const a = b;
const b = a;
_Symbol[a] in obj;
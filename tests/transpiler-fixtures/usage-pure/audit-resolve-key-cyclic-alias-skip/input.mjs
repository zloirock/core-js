// cyclic alias through computed key must terminate via seen-guard (distinct code path
// from resolveBindingToGlobal's receiver-chain guard)
const a = b;
const b = a;
Symbol[a] in obj;

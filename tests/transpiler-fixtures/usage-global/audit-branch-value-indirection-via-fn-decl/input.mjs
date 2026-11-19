function pickCtor() { return globalThis.cond ? Promise : Map; }
export const viaFnDecl = pickCtor().allSettled;

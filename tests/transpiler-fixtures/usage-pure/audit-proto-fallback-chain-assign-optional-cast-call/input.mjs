// a TS cast around the kept root: the fallback guard slices the bare assignment (both
// emitters), while a guard-ref rebuild keeps the wrapper INSIDE the memo
let tc;
export const optionalCastCall = ((tc = globalThis.window) as any)?.self.Map.prototype.get.call(new Map([[1, 2]]), 1);

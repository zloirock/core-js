// the detect a UMD prologue spells through its realm selection reads the slot before the write lands, so it
// takes what this build serves - guarded by the selection's realm, in both emitters alike - and the read
// below the write keeps the slot the detect filled. usage-pure only: the global flavor rewrites no read
var root = typeof window !== 'undefined' ? window : globalThis;
root.Promise = root.Promise || PromiseShim;
export const settled = Promise.allSettled([]);

// a bare non-polyfilled static read under the same root rides the guarded claim
let m;
export const optionalStaticMiss = (m = globalThis.window)?.self.Promise.noSuchStatic;

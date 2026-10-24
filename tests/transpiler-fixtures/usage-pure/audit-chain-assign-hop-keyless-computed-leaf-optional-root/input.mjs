// optional spellings deopt (a resolvable root's guard is dead; the hop value is always
// defined) and collapse identically
let oa;
export const optionalRoot = (oa = globalThis)?.self[0];

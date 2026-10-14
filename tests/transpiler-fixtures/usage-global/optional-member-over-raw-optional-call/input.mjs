// a claim read optionally off an optional call to a method the build does not serve memoizes that
// call as written: every `?.` it carries, a live link below it included, short-circuits inside the memo
// and the claim reads the result. a callee the build serves is a lookup of its own and takes its own
// test in the chain instead
const box = globalThis.box;
export const liveLinkBelow = box?.list.pick?.()?.at(0);
export const optionalCallee = box?.pick?.()?.includes(1);
export const callLinkBelow = box.list.flat?.().pick?.()?.findLast(Boolean);
// NEGATIVE: a served callee is a lookup of its own
export const servedCallee = box?.list.toSorted?.()?.with(0, 1);

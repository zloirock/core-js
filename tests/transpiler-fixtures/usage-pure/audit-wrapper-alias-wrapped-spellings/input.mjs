// a wrapper alias's WRAPPED spellings hand the same runtime value as the bare one, so the
// follow judges the EFFECTIVE value: a paren around the slot element, a paren around the init
// and a sequence tail all extract like the bare spelling. the NEGATIVE pins the boundary: a
// spread hidden by the wrapper still makes the union incomplete, and the follow declines whole
const [parenElement] = [([globalThis])];
export const [{ Object: { fromEntries: viaParenElement } }] = parenElement;
const [parenInit] = ([[globalThis]]);
export const [{ Object: { groupBy: viaParenInit } }] = parenInit;
let seq = 0;
const [seqInit] = (seq++, [[globalThis]]);
export const [{ Array: { from: viaSeqInit } }] = seqInit;
const xs = [];
const [spreadUnderParen] = ([...xs, [globalThis]]);
export const [{ Object: { assign: staysNative } }] = spreadUnderParen;
export const results = [viaParenElement([["k", 1]]), viaParenInit([2], x => x), viaSeqInit([3]), staysNative({}, { a: 4 })];

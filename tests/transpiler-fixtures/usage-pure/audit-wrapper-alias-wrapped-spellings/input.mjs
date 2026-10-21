// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
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

// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const obj = {};
const { Array: { from }, [Symbol.iterator]: { next = [1].at(0) } } = obj;
// prop-level default: the helper result is guarded (a memoized `=== void 0` test), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = { done: true };
const { [Symbol.iterator]: { done } = fb } = obj;
const arr = [3];
const { [Symbol.iterator]: { name, ...restOfMethod } } = arr;
// all-proxy ternary receiver: the collapse extracts the sibling static AND the symbol pattern
const { Set: { union }, [Symbol.iterator]: { next: n2 } } = globalThis.Set ? globalThis : globalThis;
// a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const { [Symbol.iterator]: { [Symbol.toPrimitive]: tp } } = [1];
// A computed key and iterator pattern share one receiver and execute their reads in source order.
let c = 0;
const { [(c++, 'of')]: of, [Symbol.iterator]: { name: iterName2 } } = Array;
// memoize-class receivers extract through a shared `_ref` (single read): a CONST-LITERAL
// receiver with a multi-binding pattern, a MEMBER receiver (getter fires once), a BRANCHING
// receiver, and a CALL init (whole-init memo - the call runs once)
const { [Symbol.iterator]: { length: litArity, call: litCall } } = [7];
const { [Symbol.iterator]: { length: memArity }, sib } = holder.p;
const { [Symbol.iterator]: { length: brArity }, alt } = cond ? [8] : [];
const { [Symbol.iterator]: { length: callArity }, q } = mk();
// The member receiver is evaluated once before the computed-key and iterator reads.
const { [(k2(), 'toSorted')]: ts, [Symbol.iterator]: { length: mixArity } } = holder2.p;
// EXPORT host: the memo plants as a bare statement before the export (never exported itself)
export const { [Symbol.iterator]: { length: expArity }, expQ } = holder3.p;
export { from, next, done, name, restOfMethod, union, n2, tp, of, iterName2, c, litArity, litCall, memArity, sib, brArity, alt, callArity, q, ts, mixArity };

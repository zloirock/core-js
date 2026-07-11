// a symbol-keyed NESTED pattern extracts through the get-iterator-method helper: the pattern
// destructures the helper result (polyfill-visible where a raw symbol read misses native
// iterators), and polyfillable content in its VALUE position - an instance call in a binding
// default - is rewritten inside the extracted pattern. the sibling prop keeps the residual,
// where the consumed key retires to a sentinel
const obj = {};
const { Array: { from }, [Symbol.iterator]: { next = [1].at(0) } } = obj;
// prop-level default: the helper result is guarded (`=== void 0 ? fb : _ref`), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = { done: true };
const { [Symbol.iterator]: { done } = fb } = obj;
// rest INSIDE the extracted pattern destructures the helper result the same way; the residual
// keeps a sentinel for the consumed symbol key
const arr = [3];
const { [Symbol.iterator]: { name, ...restOfMethod } } = arr;
// all-proxy ternary receiver: the collapse extracts the sibling static AND the symbol pattern
const { Set: { union }, [Symbol.iterator]: { next: n2 } } = globalThis.Set ? globalThis : globalThis;
// a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const { [Symbol.iterator]: { [Symbol.toPrimitive]: tp } } = [1];
// an SE computed key and a symbol pattern SHARE one residual: both retire to sentinels there,
// the key effect runs once in place
let c = 0;
const { [(c++, 'of')]: of, [Symbol.iterator]: { name: iterName2 } } = Array;
export { from, next, done, name, restOfMethod, union, n2, tp, of, iterName2, c };

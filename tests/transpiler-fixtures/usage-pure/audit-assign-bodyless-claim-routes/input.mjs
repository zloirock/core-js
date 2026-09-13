// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
const log = [];
let from, rest, keyed, other, nested, sibling, kw, prefixed;
if (log.length >= 0) ({ from, ...rest } = Array);
// A computed key runs before its property read and before the following sibling read.
if (log.length >= 0) ({ [(log.push("k"), "at")]: keyed, other } = [3, [7]]);
// An unconsumed sibling remains a native read while the nested static receives its polyfill.
if (log.length >= 0) ({ Map: { groupBy: nested }, sibling } = globalThis);
// A receiver prefix keeps its own inner polyfills and executes once before the binding.
if (log.length >= 0) ({ Array: { prototype: { flat: prefixed } } } = (kw = (log.push("e"), globalThis)));
// An array wrapper with a stored receiver remains conditional: its store and instance read
// must not run when the control condition is false.
let kwWrap, wrapped;
if (log.length < 0) [{ Array: { prototype: { with: wrapped } } }] = [(kwWrap = globalThis)];
export { from, rest, keyed, other, nested, sibling, kw, prefixed, kwWrap, wrapped, log };

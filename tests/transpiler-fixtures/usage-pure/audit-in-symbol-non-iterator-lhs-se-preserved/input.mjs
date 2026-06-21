// non-iterator symbol with computed-key SE: `Symbol[(fn(), 'asyncIterator')] in obj`.
// a key other than `Symbol.iterator` must emit `_polyfill in obj`, not the iterator-specific
// `_isIterable(obj)` call; SE preservation still applies via the same structural
// side-effect harvest
declare const logCall: () => void;
declare const obj: any;
const r = Symbol[(logCall(), 'asyncIterator')] in obj;

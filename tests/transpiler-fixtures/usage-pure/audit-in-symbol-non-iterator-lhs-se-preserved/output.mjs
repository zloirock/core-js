import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// non-iterator symbol with computed-key SE: `Symbol[(fn(), 'asyncIterator')] in obj`.
// hits the ELSE branch of `handleInExpression` (`meta.key !== 'Symbol.iterator'`) which
// emits `_polyfill in obj` instead of the iterator-specific `_isIterable(obj)` call;
// SE preservation still applies via the same `visitSymbolInLhsSe` walk
declare const logCall: () => void;
declare const obj: any;
const r = (logCall(), _Symbol$asyncIterator in obj);
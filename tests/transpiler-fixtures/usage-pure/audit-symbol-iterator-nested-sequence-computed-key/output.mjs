import _getIterator from "@core-js/pure/actual/get-iterator";
// nested SequenceExpression inside a computed Symbol.iterator key: the side effect lives one
// (or more) levels deep, so the SE-prefix detection must peel nested sequences to the same
// depth as the key recognition and preserve every effect while the inner Symbol.iterator
// resolves to the static polyfill. both emitters flatten the nested sequences identically
// (`(first(), second(), _getIterator(obj))`), so there is no sidecar
export const a = (probe(), _getIterator(obj));
export const b = (first(), second(), _getIterator(obj));
export const c = (deep(), _getIterator(obj));
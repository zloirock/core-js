// nested SequenceExpression inside a computed Symbol.iterator key: the side effect lives one
// (or more) levels deep, so the SE-prefix detection must peel nested sequences to the same
// depth as the key recognition and preserve every effect while the inner Symbol.iterator
// resolves to the static polyfill. both emitters flatten the nested sequences identically
// (`(first(), second(), _getIterator(obj))`), so there is no sidecar
export const a = obj[(0, (probe(), Symbol.iterator))]();
export const b = obj[(first(), (second(), Symbol.iterator))]();
export const c = obj[(0, (1, (deep(), Symbol.iterator)))]();

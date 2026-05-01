import _isIterable from "@core-js/pure/actual/is-iterable";
import _Set from "@core-js/pure/actual/set/constructor";
// resolveKey: TemplateLiteral and BinaryExpression `+` interpolation use forked `seen` Set
// per branch so cyclic alias `const k = k` doesn't trip the cycle guard incorrectly.
// Symbol[`itera${suffix}r`] - template-literal computed key with const-aliased suffix
const suffix = 'to';
// `iter` + suffix + 'r' -> 'iterator'; resolveKey resolves the template via forked seen
const a = _isIterable([]);
// BinaryExpression `+`: 'has' + 'OwnProperty'-like usage but with Symbol.iterator shape
const k = 'iter' + 'ator';
const b = _isIterable(new _Set());
export { a, b };
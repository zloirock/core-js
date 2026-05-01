// resolveKey: TemplateLiteral and BinaryExpression `+` interpolation use forked `seen` Set
// per branch so cyclic alias `const k = k` doesn't trip the cycle guard incorrectly.
// Symbol[`itera${suffix}r`] - template-literal computed key with const-aliased suffix
const suffix = 'to';
// `iter` + suffix + 'r' -> 'iterator'; resolveKey resolves the template via forked seen
const a = Symbol[`itera${suffix}r`] in [];
// BinaryExpression `+`: 'has' + 'OwnProperty'-like usage but with Symbol.iterator shape
const k = 'iter' + 'ator';
const b = Symbol[k] in new Set();
export { a, b };

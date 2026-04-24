// `const k = 'Symbol.iterator'; k in obj` - `k` is bound to a plain string literal,
// not to the well-known symbol. plugin must not treat the string content as a symbol
// reference; expression stays untouched. contrast `audit-bound-symbol-iterator-in`
// where `k` is bound to the actual `Symbol.iterator` member expression and polyfill IS emitted
const k = 'Symbol.iterator';
k in obj;

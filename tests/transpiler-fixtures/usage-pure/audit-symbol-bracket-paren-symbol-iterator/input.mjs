// `Symbol[(Symbol.iterator)] in obj` - inner `Symbol.iterator` wrapped in extra parens.
// resolveKey peels the parens around the computed key and resolves to `Symbol.iterator`.
// since the key already starts with `Symbol.`, the outer in-handler routes to
// get-iterator-method instead of double-prefixing to `Symbol.Symbol.iterator`.
const x = Symbol[(Symbol.iterator)] in obj;
export { x };

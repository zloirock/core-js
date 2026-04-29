import _includes from "@core-js/pure/actual/instance/includes";
// `(arr.includes)(1)` when the parser keeps parens as AST nodes parses as a call expression
// whose callee is a paren wrapper around the member access. Polyfill emission peels
// through the parens so the receiver binds correctly: the emitted `.call(arr, ...)` keeps
// `this === arr` regardless of paren wrapping
_includes(arr).call(arr, 1);
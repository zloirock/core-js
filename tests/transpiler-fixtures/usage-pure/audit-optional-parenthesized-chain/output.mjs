import _includes from "@core-js/pure/actual/instance/includes";
// parenthesised optional chain `(x?.a)?.b`: parentheses must not break the chain
// tracking for downstream pure-mode polyfill rewrites.
(arr == null ? void 0 : _includes(arr))(1);
// parenthesised optional chain `(x?.a)?.b`: parentheses must not break the chain
// tracking for downstream pure-mode polyfill rewrites.
(arr?.includes)(1);

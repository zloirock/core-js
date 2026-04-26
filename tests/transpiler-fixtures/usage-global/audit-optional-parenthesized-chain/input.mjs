// parenthesised optional chain `(x?.a)?.b`: parentheses must not break the chain
// tracking for downstream instance polyfill rewrites.
(arr?.includes)(1);

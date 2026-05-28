// parenthesized optional member + non-optional outer call. parens terminate the optional
// chain, so on nullish receiver native evaluates `(undefined)()` and throws TypeError. the
// polyfill must emit a bare `_getIterator(receiver)` (NOT `recv == null ? void 0 : ...`) or
// the throw is swallowed into `void 0`. contrast: a real optional chain without the parens
// (covered elsewhere) keeps the nullish guard. non-trivial receiver evaluated exactly once
const a = (arr?.[Symbol.iterator])();
const b = (getArr()?.[Symbol.iterator])();
[a, b];

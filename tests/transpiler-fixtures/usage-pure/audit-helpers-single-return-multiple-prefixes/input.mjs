// singleReturnBodyExpression strict allowlist: ExpressionStatement prefixes are
// preserved by callers via meta.sideEffects; all three IIFEs run multiple ExpressionStatement
// prefix lines before a single return. distinct prototype methods (.at / .findLast / .toSorted)
// surface per-receiver dispatch; the return value drives polyfill resolution for each
const ax = (() => { logA(); logB(); return [10, 20, 30]; })().at(-1);
const fx = (() => { logA(); logB(); logC(); return [1, 2, 3]; })().findLast(v => v > 0);
const tx = (() => { logA(); return [3, 1, 2]; })().toSorted();
export { ax, fx, tx };

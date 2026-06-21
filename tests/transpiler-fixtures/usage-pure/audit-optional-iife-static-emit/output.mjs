import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// IIFE receiver into the static-emit path: `(() => Symbol)?.().iterator` inlines the IIFE
// return to Symbol, then routes through the global/static emit. the inner `Symbol` Identifier
// must be marked skipped so the parallel substitution does not compose inside the outer
// `_Symbol$iterator` emit and produce `__Symbol$iterator`.
const a = _Symbol$iterator;
export { a };
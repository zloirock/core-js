// IIFE receiver into the static-emit path: `(() => Symbol)?.().iterator` resolves the
// receiver to Symbol via inlineCallReturnExpression, then routes through replaceGlobalOrStatic.
// the inner `Symbol` Identifier must be marked skipped (via `unwrapReceiverLeaf`) so the
// parallel substitution doesn't compose inside the outer's `_Symbol$iterator` emit and
// produce `__Symbol$iterator`
const a = (() => Symbol)?.().iterator;
export { a };

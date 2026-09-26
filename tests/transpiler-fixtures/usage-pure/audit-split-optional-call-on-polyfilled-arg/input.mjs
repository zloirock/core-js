// An optional-chain method call whose ARGUMENT is itself polyfilled (`b.flat()`): the inner helper composes
// into the `.at?.()` call's argument, so that optional-call suffix is no longer verbatim. Both array helpers
// still inject and the split stays correct with the argument's own polyfill nested inside the call.
const arr = [[1]];
const b = [[2]];

export const r = (arr.flat()).at?.(b.flat().length);

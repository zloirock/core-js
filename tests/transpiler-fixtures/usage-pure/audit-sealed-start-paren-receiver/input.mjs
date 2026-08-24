// the parens around the RECEIVER end the chain there: the `?.` inside them short-circuits only the
// sealed value, and the dispatch above reads it plainly. counting that `?.` as the receiver's own
// live one lifts a guard over the whole dispatch and answers undefined where the source throws
const host = {};
export const sealedOptionalCall = (host.box?.missing).flat?.().at(0);
export const sealedDispatchCall = (host.box?.missing).at?.(0);
export const sealedPlainCall = (host.box?.missing).flat().at(0);
export const doubledWrapper = ((host.box?.missing)).flat?.();

// NEGATIVE: unsealed, the same `?.` guards the whole chain and the dispatch rides inside it.
// the doubled wrapper's inner parens are grouping only and reprint away - the same value
// either way
export const unsealed = host.box?.missing.flat?.().at(0);

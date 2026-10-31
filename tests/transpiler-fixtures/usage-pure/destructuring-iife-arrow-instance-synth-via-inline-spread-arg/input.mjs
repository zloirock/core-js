// The argument position is read from the SAME resolver that located the receiver, so an argument the resolver expanded out of an
// inline-array spread keeps its receiver TYPING - deriving the position by identity over top-level `arguments` cannot see inside
// the spread and demoted these to the generic dispatcher.
export const viaInlineSpreadArg = (({ at: atSpread }) => atSpread)(...[[1, 2]]);

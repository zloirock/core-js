// A ternary CONSUMES the guarded chain: the root-boundary gate accepts the chain inside the
// test position, and the guard-memo wraps only the chain, not the branches.
const k = { l: [[8]] };
export const viaTernary = k.l?.flat(0) ? k.l.flat(1) : null;

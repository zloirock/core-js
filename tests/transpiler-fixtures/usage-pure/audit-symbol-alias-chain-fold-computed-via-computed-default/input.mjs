// a CONSTANT-RESOLVED computed-key destructured alias (`{ [k]: S }`, key = const-bound
// string) collapses to a simple alias, whose chain-follow crosses UNCONDITIONALLY - the
// defaulted AND the plain consumer both fold
const kc = 'Symbol';
const { [kc]: ComputedSymbol } = globalThis;
const { iterator: viaComputedDefault = fb } = ComputedSymbol;
export const g = [13, 14][viaComputedDefault];

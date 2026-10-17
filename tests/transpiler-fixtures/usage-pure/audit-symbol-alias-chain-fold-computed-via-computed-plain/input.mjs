// a CONSTANT-RESOLVED computed-key destructured alias (`{ [k]: S }`, key = const-bound
// string) collapses to a simple alias, whose chain-follow crosses UNCONDITIONALLY - the
// defaulted AND the plain consumer both fold
const kc = 'Symbol';
const { [kc]: ComputedSymbol2 } = globalThis;
const { iterator: viaComputedPlain } = ComputedSymbol2;
export const h = [15, 16][viaComputedPlain];

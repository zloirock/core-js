// Computed-key destructures retain the optional probe and plain read above a seal.
// A missing receiver throws before the pattern key effect runs.
// The defined-hop case keeps its plain receiver and one key effect.
let c9 = 0;
export const { [(c9++, 'isArray')]: viaDefinedHopSeKeyResidual } = globalThis.self.Array;
export { c9 };

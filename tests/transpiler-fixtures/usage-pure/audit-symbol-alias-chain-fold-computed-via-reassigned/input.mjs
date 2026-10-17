// a PROVABLY-REASSIGNED key (unconditional dominating write) resolves to the reaching
// value - the write IS the runtime key, so the chain folds and the target engine gets its
// polyfill; the dead init never drives the fold
let kr = 'Array';
kr = 'Symbol';
const { [kr]: ReassignedSymbol } = globalThis;
const { iterator: viaReassigned = fb } = ReassignedSymbol;
export const j = [19, 20][viaReassigned];

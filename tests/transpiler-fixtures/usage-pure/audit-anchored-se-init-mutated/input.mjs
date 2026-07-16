// SLOT-mutated ctors keep the anchored SE-init residual on the RAW member read (the user's
// replacement must win), while the SE still replays exactly once ahead of it. mutations
// live in their own fixture - the pre-pass poisons the whole file.
globalThis.Map = Shim;
const { Map: { customSM } } = (eff(), globalThis);
// chain-assignment init against a second mutated ctor - the rescued assignment replays
globalThis.Set = Shim2;
let qm;
const { Set: { customSN } } = (qm = globalThis);
export const r = [customSM, qm, customSN];

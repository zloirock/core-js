// Mutated constructors retain their source slots and the user's replacement.
// Initializer effects run once before those reads; no raw hop needs a new anchor.
globalThis.Map = Shim;
const { Map: { customSM } } = (eff(), globalThis);
// chain-assignment init against a second mutated ctor - the rescued assignment replays
globalThis.Set = Shim2;
let qm;
const { Set: { customSN } } = (qm = globalThis);
export const r = [customSM, qm, customSN];

import _globalThis from "@core-js/pure/actual/global-this";
// Mutated constructors retain their source slots and the user's replacement.
// Initializer effects run once before those reads; no raw hop needs a new anchor.
_globalThis.Map = Shim;
const {
  Map: {
    customSM
  }
} = (eff(), _globalThis);
// chain-assignment init against a second mutated ctor - the rescued assignment replays
_globalThis.Set = Shim2;
let qm;
const {
  Set: {
    customSN
  }
} = qm = _globalThis;
export const r = [customSM, qm, customSN];
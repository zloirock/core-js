import _globalThis from "@core-js/pure/actual/global-this";
// SLOT-mutated ctors keep the anchored SE-init residual on the RAW member read (the user's
// replacement must win), while the SE still replays exactly once ahead of it. mutations
// live in their own fixture - the pre-pass poisons the whole file.
_globalThis.Map = Shim;
const {
  customSM
} = (eff(), _globalThis.Map);
// chain-assignment init against a second mutated ctor - the rescued assignment replays
_globalThis.Set = Shim2;
let qm;
const {
  customSN
} = (qm = _globalThis, _globalThis.Set);
export const r = [customSM, qm, customSN];
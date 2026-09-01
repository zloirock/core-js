import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref;
// a kept WRITE the source reads through an enclosing SEQUENCE takes the same collapse as the write
// read directly: the sequence hands its tail on, so the realm hop above it reads the value that
// write stored. the `?.` there guards the always-defined store and is dead, the tail folds, and the
// base is the ROOT binding the collapse landed - the sequence prefix re-emits where the source ran it
let v, out;
function eff() {}
let g1;
out = (g1 = _globalThis, v = _self, g1).noSuchStatic;

// a `delete` reads nothing over its navigation, so the same fold answers there
let g2;
export const deleted = delete (g2 = _globalThis, v = _self, g2).noSuchStatic;

// a stored value carrying EFFECTS of its own keeps the store as the read - the source sequence is
// what runs them, and re-reading a base beside it would spell that run a second time. the realm hop
// above still folds: the store hands its value on, and the dropped hop's `?.` slides one member up
let g3;
export const withKeyEffect = (g3 = _globalThis, v = (eff(), _self))?.noSuchStatic;

// ... and the MIRROR of that shape - the sequence INSIDE the value the store holds: what the store
// hands on is that sequence's tail, so the run over it proves exactly like its prefix-less twin. read
// raw the proof found a sequence where it wanted a root, kept the `?.` and spelled the run RAW off
// the ponyfill root - a host read that is undefined in the very realms the ponyfill serves
let g7;
export const seqInStoreClaim = (g7 = (eff(), _globalThis), _Map);
export const seqInStoreNav = (g7 = (eff(), _globalThis), _globalThis).noSuchStatic;

// NEGATIVE: the store holding the PROBE keeps its `?.` - the sequence hands that value on, so the
// optional guards a read that genuinely short-circuits and nothing above it folds
let g5;
export const overProbeStore = null == (_ref = (eff(), g5 = _globalThis.window)) ? void 0 : _atMaybeArray(_ref.Array.prototype);

// NEGATIVE: a tail hop the pure build CAN back is no realm self-reference the fold takes
let g4;
export const backedTail = (g4 = _globalThis, v = _self, _Number$MAX_SAFE_INTEGER);

// the `?.` over the store is DEAD for a claim above too: the store hands the always-defined
// ponyfill on, so the instance dispatch takes its receiver plain instead of memoizing a guard
let g6, w6;
export const deadOptionalClaim = _atMaybeArray((g6 = _globalThis, w6 = _self).Array.prototype);

// the fold is INDEPENDENT of which spelling roots the probe: an alias written outside the
// sequence and the bare global root take the same fold as the same-sequence alias - the store
// hands the guarded value on either way, and the probe's `?.` slides one member up
const ga7 = _globalThis;
let w7;
export const aliasWrittenElsewhere = (w7 = null == ga7.window ? void 0 : _self)?.noSuchStatic;
let w8;
export const bareRootStore = (w8 = null == _globalThis.window ? void 0 : _self)?.noSuchStatic;

// a PLAIN hop folds too, ERASING the `?.` above: a void store then throws on the member above
// exactly where the source threw on the hop, and over a defined value the guard was vestigial
let w9;
export const plainHopOverGuardStore = (w9 = null == ga7.window ? void 0 : _self).noSuchStatic;

// NEGATIVE: the hop at the CHAIN END has no member to carry the read - it keeps its shape
let w10;
export const chainEndKeepsHop = (w10 = null == ga7.window ? void 0 : _self).window;

// NEGATIVE: a store whose value ends on a hop pure cannot back hands on the raw host read - the
// probe itself - and nothing over it folds, however foldable the hop above would read elsewhere
let w11;
export const probeStoreKeepsRealmTail = (w11 = _globalThis.window)?.window.noSuchStatic;
export { v, out };
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// ... and WHO holds the value a store hands on: a read THROUGH it is the consumer's own, and that
// read is the proof the value must be the realm object - so the probe folds there whatever the run
// carries, where the bare store beside it keeps the collapse's own spelling. every channel that
// reads through answers the same way: a claim, its guard, an instance dispatch, a call, a
// destructure - and so does the same run rooted in a proven call
let e = 0;
let held;
function dh() {
  return _globalThis;
}
export const claimed = _nameMaybeFunction((held = (e++, _self), _Map));
export const guarded = null == (held = (e++, _self)) ? void 0 : _Map;
export const instanced = _nameMaybeFunction(_atMaybeArray((held = (e++, _self)).Array.prototype));
export const called = (held = (e++, _self), _Array$of)(1);
export const callRootGuarded = null == (held = (e++, _self)) ? void 0 : _Map;
export const callRootClaimed = _nameMaybeFunction((held = (e++, _self), _Map));
export const callRootInstanced = _nameMaybeFunction(_atMaybeArray((held = (e++, _self)).Array.prototype));
export const callRootDeleted = delete (held = (e++, _self)).customCallSlot;
// ... a `delete` reads nothing over its own navigation, but it does read THROUGH the store below
// it - and only a CUSTOM slot is deleted here, so no realm hop of the file deopts
export const deleted = delete (held = (e++, _self)).customDeleteSlot;
held = (e++, _self);
const Destructured = _Map; // ... and its assignment-PATTERN twin, whose slots come off the same folded value: the lift
// re-emits the write verbatim, so the effect inside the run rides along with it
let Assigned;
held = (e++, _self);
Assigned = _Map;

// ... and a tail the fold cannot take keeps its place through every one of them: a KEY carrying
// effects has nowhere to replay them in the folded value, so the collapse spells its own base -
// the claim's ponyfill, never the root a stand-down would read the probe off
function eff(t) {
  return t;
}
export const seKeyedGuarded = null == (held = (eff('a'), _self)[eff('b'), 'window']) ? void 0 : _Map;
export const seKeyedCallRoot = _nameMaybeFunction((held = _self[e++, 'window'], _Map));
// ... and a BACKED hop spelled the same way keeps the value canon over the kept-root one: what the
// fold erases above it navigates nothing, so the claim's own ponyfill is the base
export const seKeyedHop = _nameMaybeFunction((held = (eff('c'), _self), _Map));
export const seKeyedHopCallRoot = null == (held = (eff('d'), _self)) ? void 0 : _Map;

// ... and the NEGATIVES beside them: reading the stored value without dereferencing it is not
// reading THROUGH it, so nothing proves what the value must be and the collapse keeps its spelling
export const typed = typeof (held = (e++, _self).window);
export const discarded = (held = (e++, _self).window, 7);
export { e, held, Destructured, Assigned };
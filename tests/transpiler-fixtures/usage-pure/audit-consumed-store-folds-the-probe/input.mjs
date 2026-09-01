// ... and WHO holds the value a store hands on: a read THROUGH it is the consumer's own, and that
// read is the proof the value must be the realm object - so the probe folds there whatever the run
// carries, where the bare store beside it keeps the collapse's own spelling. every channel that
// reads through answers the same way: a claim, its guard, an instance dispatch, a call, a
// destructure - and so does the same run rooted in a proven call
let e = 0;
let held;
function dh() {
  return globalThis;
}
export const claimed = (held = (e++, globalThis.self).window).Map.name;
export const guarded = (held = (e++, globalThis.self).window)?.Map;
export const instanced = (held = (e++, globalThis.self).window).Array.prototype.at.name;
export const called = (held = (e++, globalThis.self).window).Array.of(1);
export const callRootGuarded = (held = (e++, dh()).self.window)?.Map;
export const callRootClaimed = (held = (e++, dh()).self.window).Map.name;
export const callRootInstanced = (held = (e++, dh()).self.window).Array.prototype.at.name;
export const callRootDeleted = delete (held = (e++, dh()).self.window).customCallSlot;
// ... a `delete` reads nothing over its own navigation, but it does read THROUGH the store below
// it - and only a CUSTOM slot is deleted here, so no realm hop of the file deopts
export const deleted = delete (held = (e++, globalThis.self).window).customDeleteSlot;
const { Map: Destructured } = (held = (e++, globalThis.self).window);
// ... and its assignment-PATTERN twin, whose slots come off the same folded value: the lift
// re-emits the write verbatim, so the effect inside the run rides along with it
let Assigned;
({ Map: Assigned } = (held = (e++, globalThis.self).window));

// ... and a tail the fold cannot take keeps its place through every one of them: a KEY carrying
// effects has nowhere to replay them in the folded value, so the collapse spells its own base -
// the claim's ponyfill, never the root a stand-down would read the probe off
function eff(t) {
  return t;
}
export const seKeyedGuarded = (held = globalThis[eff('a'), 'self'][eff('b'), 'window'])?.Map;
export const seKeyedCallRoot = (held = dh().self[(e++, 'window')]).Map.name;
// ... and a BACKED hop spelled the same way keeps the value canon over the kept-root one: what the
// fold erases above it navigates nothing, so the claim's own ponyfill is the base
export const seKeyedHop = (held = globalThis[eff('c'), 'self'].window).Map.name;
export const seKeyedHopCallRoot = (held = dh()[eff('d'), 'self'].window)?.Map;

// ... and the NEGATIVES beside them: reading the stored value without dereferencing it is not
// reading THROUGH it, so nothing proves what the value must be and the collapse keeps its spelling
export const typed = typeof (held = (e++, globalThis.self).window);
export const discarded = ((held = (e++, globalThis.self).window), 7);
export { e, held, Destructured, Assigned };

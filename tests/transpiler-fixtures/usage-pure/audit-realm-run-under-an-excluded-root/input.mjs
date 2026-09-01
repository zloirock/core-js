// what a realm run rides when this BUILD cannot spell its root: the entry exists in the package and
// the configuration excluded it, so nothing may substitute the root itself - but the canon judges a
// hop by the entry EXISTING, and `web.self` was not excluded, so the run still rides the deepest
// span pure can back. marking those hops handled would strand the whole run raw, which is the one
// spelling the pure method exists to prevent
let q;
export const probeRun = globalThis.self.window;
export const navigated = globalThis.self.Array;
export const value = globalThis.self;
export const claimThrough = globalThis.self.window.Map;
export const storeThrough = (q = globalThis.self.window).Map.name;

// ... and every consumer of such a run rides the same span: a `delete` reaches its slot off it, and
// a dispatch above it reads its receiver through it - a plan that stood down here left the whole
// navigation raw, the one spelling the pure method exists to prevent
const box = { self: {} };
export const deleteRun = delete globalThis.self.window;
export const deleteAboveDispatch = delete globalThis.self.box.list.at.name;
export const readAboveDispatch = globalThis.self.box.list.at.name;

// ... and a hop reached through a COMPUTED key rides the same span: what its key DID re-emits ahead
// of the binding, exactly as the kept-root canon spells it - refusing the key here left the whole run
// raw on one leg while the other rode it
let e = 0;
export const seKeyedHop = globalThis[(e++, 'self')].box.list;
export { e };

// ... and a `?.` over such a run guards nothing once the run rides the span pure CAN back: the read
// lands an always-defined binding, so the guard erases with the hops it was reading - whichever hop
// of the run the source wrote it on
export const guardedTail = globalThis.self.window?.customProp;
export const guardedHop = globalThis.self?.window.customProp;
export const guardedBoth = globalThis.self?.window?.customProp;
export const guardedOverStore = (q = (globalThis)).self.window?.customProp;

// NEGATIVE: the excluded root read on its own has nothing to ride - it stays the source's own read
export const bareRoot = globalThis;
export { q };

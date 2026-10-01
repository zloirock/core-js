import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a carrier standing between the root and the probe runs its effects ahead of the guard, and the
// read member's own key effect runs INSIDE it - the guard render has a slot for each, so how MANY
// of them there are decides nothing. counted instead, a receiver carrying two lost the
// short-circuit the source wrote while its one-effect twin beside it kept one
let ticks = 0;
export const readTwoEffectCarrier = (ticks++, ticks++, null == _globalThis.window ? void 0 : _Promise[ticks++, 'noSuchStatic']);
export const readOneEffectCarrier = (ticks++, null == _globalThis.window ? void 0 : _Promise[ticks++, 'noSuchStatic']);
export { ticks };
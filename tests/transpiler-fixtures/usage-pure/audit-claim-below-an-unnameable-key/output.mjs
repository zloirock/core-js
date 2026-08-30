import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a key the claim walk cannot NAME is a step, not a stop: the constructor below a computed one
// still owes its swap, and ending the walk there handed the chain to the fold and left the ctor
// reading raw off the ponyfill - undefined on every engine the polyfill exists for
let key;
export const deleteOverComputedKey = delete _Promise[key].userSlot;
export const readOverComputedKey = null == _globalThis.window ? void 0 : _Promise[key].userSlot;
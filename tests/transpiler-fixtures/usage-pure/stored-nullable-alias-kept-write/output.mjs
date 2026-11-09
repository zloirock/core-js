import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A consumed assignment cannot replace the throwing alias read with a defined realm.
const held = _globalThis.window;
let first, second;
export const value = first = second = (held.self, _self);
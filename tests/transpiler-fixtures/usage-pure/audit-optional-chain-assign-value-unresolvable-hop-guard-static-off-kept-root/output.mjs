import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a STATIC terminal reached through the same kept root: erasing the receiver navigation would take the
// live guard with it, so the claim re-hangs INSIDE the preserved guard as an optional callee - the target
// engine still gets the ponyfill where the native static is missing, and the source short-circuit stays.
// the resolvable twin erases outright: there the guard is dead, so erasing it costs nothing
let sw;
export const staticOffKeptRoot = (null == (sw = _globalThis.window) ? void 0 : _Array$from)?.(['a']);
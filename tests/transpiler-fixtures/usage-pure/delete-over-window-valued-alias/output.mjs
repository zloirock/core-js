import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// An alias holding the environment probe's value is absent wherever that probe is, so the optional
// link over it decides whether a `delete` acts at all: the guard on the alias takes the operator,
// through the realm hops above it and past a static alike. A paren seals the hop's read away from
// the operator, and the plain twin reads the alias plainly - both throw off-window, as the source does.
const win = _globalThis.window;
let late;
late = _self.window;
export const viaSelfHop = null == win ? true : delete _self.slot;
export const viaRealmHop = null == late ? true : delete _globalThis.box.slot;
export const viaStatic = null == win ? true : delete _self.Array.noSuchStatic;
export const sealed = delete (null == win ? void 0 : _self).slot;
export const plainTwin = delete win.slot;
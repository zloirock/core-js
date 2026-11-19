// An alias holding the environment probe's value is absent wherever that probe is, so the optional
// link over it decides whether a `delete` acts at all: the guard on the alias takes the operator,
// through the realm hops above it and past a static alike. A paren seals the hop's read away from
// the operator, and the plain twin reads the alias plainly - both throw off-window, as the source does.
const win = globalThis.window;
let late;
late = self.window;
export const viaSelfHop = delete win?.self.slot;
export const viaRealmHop = delete late?.globalThis.box.slot;
export const viaStatic = delete win?.self.Array.noSuchStatic;
export const sealed = delete (win?.self).slot;
export const plainTwin = delete win.globalThis.slot;

import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A local alias of the realm reads `window` as the realm name it holds: an optional link over that
// read is the environment probe the source observes, so the run stays spelled and short-circuits
// off-window. A backed hop's `?.` is dead and folds onto the alias, a plain unbacked hop folds as
// the collapse model takes it, and a parameter shadowing the name holds the user's own object.
const g = _globalThis;
const s = _self;
export const read = g.window?.Array;
export const viaSelf = s.window?.Error;
export const built = new (g.window?.RegExp)("a");
export const kind = typeof g.window?.Date;
export const slot = g["window"]?.userSlot;
export const backed = g.Function;
export const plain = g.Boolean;
export function shadowed(g) {
  return g.window?.Number;
}
// A global read off a realm alias through an optional `window` link pulls its modules whether the
// probe short-circuits or not: the alias of `globalThis` and of `self`, a construct, a `typeof`,
// a computed hop, a backed hop and a plain one each detect the global they read, and a parameter
// shadowing the alias name reads the user's own object.
const g = globalThis;
const s = self;
export const read = g.window?.Array;
export const viaSelf = s.window?.Error;
export const built = new (g.window?.RegExp)("a");
export const kind = typeof g.window?.Date;
export const slot = g["window"]?.userSlot;
export const backed = g.self?.Function;
export const plain = g.window.Boolean;
export function shadowed(g) {
  return g.window?.Number;
}

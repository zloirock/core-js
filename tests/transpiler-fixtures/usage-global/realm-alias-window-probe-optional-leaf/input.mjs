// A global read off a realm alias through an optional `window` link pulls its modules whether the
// probe short-circuits or not: the alias of `globalThis` and of `self`, a construct, a `typeof`,
// a computed hop, a backed hop and a plain one each detect the global they read, and a parameter
// shadowing the alias name reads the user's own object. A user slot adds no imports.
const g = globalThis;
const s = self;
export const read = g.window?.Map;
export const viaSelf = s.window?.Error;
export const built = new (g.window?.RegExp)("a");
export const kind = typeof g.window?.Set;
export const slot = g["window"]?.userSlot;
export const computed = g["window"]?.DOMException;
export const backed = g.self?.WeakSet;
export const plain = g.window.SuppressedError;
export function shadowed(g) {
  return g.window?.WeakMap;
}

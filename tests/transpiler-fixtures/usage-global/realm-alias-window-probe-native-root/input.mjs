// On targets carrying `globalThis` and `self` natively a realm alias keeps the native name and is
// still the realm: reads and deletes through its optional `window` link detect the globals they
// navigate, while a parameter shadowing the alias name reads the user's own object.
const g = globalThis;
const s = self;
export const read = g.window?.Iterator;
export const deep = s.window?.self.Map;
export const call = g.window?.Promise.withResolvers();
export const removed = delete g.window?.Set.userKey;
export const removedSlot = delete s.window?.userSlot;
export const removedHop = delete g.window?.self.userKey;
export function shadowed(g) {
  return delete g.window?.WeakMap.userKey;
}

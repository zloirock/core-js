import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// On targets carrying `globalThis` and `self` natively the alias keeps the native realm name, and it
// is still the realm: no pure entry backs it, yet it is never absent. A `window?.` read off it is
// the environment probe either way - kept by a read, and kept by a `delete`, whose short-circuit
// decides whether the slot is removed at all. A shadowing parameter holds the user's own object.
const g = globalThis;
const s = self;
export const read = g.window?.Array;
export const deep = null == s.window ? void 0 : _Map;
export const call = g.window?.Promise.resolve(1);
export const removed = null == g.window ? true : delete _Set.userKey;
export const removedSlot = delete s.window?.userSlot;
export const removedHop = delete g.window?.self.userKey;
export function shadowed(g) {
  return delete g.window?.WeakMap.userKey;
}
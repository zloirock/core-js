// Only the hop read straight off the root can be absent, so only it earns the guard, and only where
// the `?.` right above it reads it: the realm hops repeated past it are self-references, whatever
// spells the root. The value a kept write stores is still the one tested, and a `delete` keeps the
// guard deciding whether it lands.
const g = globalThis;
const f = () => globalThis;
let e = 0;
let held;
export const direct = globalThis.window?.window?.self.box;
export const viaSelf = self.window?.window?.window?.self.cfg;
export const viaAlias = g.window?.window?.self.api;
export const viaCall = f().window?.window?.self.list;
export const viaSequence = (e++, globalThis.window)?.window?.self.mode;
export const stored = (held = globalThis.window?.window)?.self.Array.of(1);
export const removed = delete globalThis.self?.window?.window?.self.slot;

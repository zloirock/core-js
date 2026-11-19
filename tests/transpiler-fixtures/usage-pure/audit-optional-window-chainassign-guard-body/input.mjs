// a chain-assign root storing an UNDEFINABLE proxy nav (`globalThis.window` - `window` has no pure entry)
// under an optional `?.`, consumed by a polyfilled dispatch. the value is STORED, so the chain cannot root
// through to the pure global (that would rebind the variable) - the guard is correctly KEPT. but the guard
// root must still SUBSTITUTE its own proxy nav (`w = _globalThis.window`, not raw `globalThis` -> IE11
// ReferenceError) and the receiver-INDEPENDENT body must COLLAPSE to the pure ctor (`_Map` / `_Array$of`,
// not a raw `_ref.Map` native read). the assign SE runs ONCE in the guard. distinct ctor/static + trailer
// per line; single-hop and multi-hop (self.window); both emitters converge.
let w, v, u;
export const ctorName = (w = globalThis.window)?.Map.name;
export const staticAt = (v = globalThis.window)?.Array.of(5).at(0);
export const multiHopFrom = (u = globalThis.self.window)?.Array.from([1]).includes(1);

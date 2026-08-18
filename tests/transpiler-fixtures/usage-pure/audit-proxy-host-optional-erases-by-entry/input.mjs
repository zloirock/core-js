// a `?.` over the host of a proxy-global navigation is not load-bearing when the host is a name the
// pure package can back: the collapse replaces the whole navigation, so the guard goes with it. the
// question is whether the ENTRY EXISTS, never whether this target asked for it - reading a hop the
// target already has natively as "unresolvable" turns an erasable navigation into an environment
// probe, and the two emitters then answer one source differently.
// a host pure cannot back at all is the genuine probe and keeps its guard, on every target.
export const selfHost = globalThis.self?.Map.name;
export const selfHostExtract = globalThis.self?.Map;
export const seqSelfHost = (0, globalThis.self)?.Map.name;
// NEGATIVE: no `_window` exists, so this one really is the host probe
export const windowHost = globalThis.window?.Map.name;
export const windowHostExtract = globalThis.window?.Map;

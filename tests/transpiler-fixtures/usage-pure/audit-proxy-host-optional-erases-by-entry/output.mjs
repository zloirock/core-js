import _Map from "@core-js/pure/actual/map/constructor";
// a `?.` over the host of a proxy-global navigation is not load-bearing when the host is a name the
// pure package can back: the collapse replaces the whole navigation, so the guard goes with it. the
// question is whether the ENTRY EXISTS, never whether this target asked for it - reading a hop the
// target already has natively as "unresolvable" turns an erasable navigation into an environment
// probe, and the two emitters then answer one source differently.
// a host pure cannot back at all is the genuine probe and keeps its guard, on every target.
export const selfHost = _Map.name;
export const selfHostExtract = _Map;
export const seqSelfHost = _Map.name;
// NEGATIVE: no `_window` exists, so this one really is the host probe
export const windowHost = null == globalThis.window ? void 0 : _Map.name;
export const windowHostExtract = null == globalThis.window ? void 0 : _Map;
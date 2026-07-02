import _globalThis from "@core-js/pure/actual/global-this";
// the computed key is a genuinely runtime value (read off another object), not a compile-time
// constant - it cannot be resolved to a slot name statically, so the global stays untracked and
// the logical-assign warning gate stays closed
const k = _globalThis.someProp;
_globalThis[k] ||= {};
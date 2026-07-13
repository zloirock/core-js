import _globalThis from "@core-js/pure/actual/global-this";
// a globalThis logical-assign whose computed key is a const string (`globalThis[k] ||= ...`
// with `const k = "Map"`) names the same slot as `globalThis.Map ||= ...`: the const key
// resolves, the slot records and the name deopts like the dotted form
const k = "Map";
_globalThis[k] ||= {};
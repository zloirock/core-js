import _Map from "@core-js/pure/actual/map/constructor";
// `!globalThis.Map` - pure existence check against the proxy global. proxy-member detection
// fires on the MemberExpression regardless of the enclosing UnaryExpression: we swap
// `globalThis.Map` with `_Map` and leave the `!` in place so truthiness of the polyfill id
// drives the branch
if (!_Map) throw new Error("Map missing");
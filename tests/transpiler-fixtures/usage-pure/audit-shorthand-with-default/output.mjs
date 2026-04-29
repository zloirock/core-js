import _Map from "@core-js/pure/actual/map/constructor";
// shorthand destructure with default: `{ Map = fallback } = globalThis`. the shorthand entry
// has key=identifier(Map), value=default-value-param around identifier(Map) and `fallback`.
// the extracted `const Map = ...` ternary preserves the fallback branch - `new Map()` stays
// as a reference to the local binding so a hypothetical undefined polyfill (MyFallback path)
// still routes through it rather than dying on `new undefined`
const Map = _Map === void 0 ? MyFallback : _Map;
new Map();
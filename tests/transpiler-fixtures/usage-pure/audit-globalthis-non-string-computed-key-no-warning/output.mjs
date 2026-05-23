import _globalThis from "@core-js/pure/actual/global-this";
// numeric computed key - `memberKeyName` returns null, gate doesn't fire, no warning
// (no real global has a numeric name; treat as a generic property write)
_globalThis[42] ||= {};
import _globalThis from "@core-js/pure/actual/global-this";
// numeric computed key on proxy-global - the key does not resolve to a string name, so
// the gate doesn't fire and no warning surfaces (no real global has a numeric name;
// treat as a generic property write)
_globalThis[42] ||= {};
import _globalThis from "@core-js/pure/actual/global-this";
// multiple proxy-global member logical-assigns in one file - each surfaces its own
// warning tagged with the pre-transform global name (`Symbol`, `WeakMap`), not the
// post-rewrite identifier, so the diagnostic stays readable
_globalThis.Symbol ||= {};
_globalThis.WeakMap ||= {};
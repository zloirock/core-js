import _Map from "@core-js/pure/actual/map/constructor";
// global call wrapped in TS `as` `((globalThis as any).Map)(...)`: the cast is peeled
// so the polyfill rewrite recognises the call.
_Map();
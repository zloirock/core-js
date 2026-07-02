import _Map from "@core-js/pure/actual/map/constructor";
// async IIFE returns Promise<T>, not T - inline-call resolution must bail
const out = (async () => _Map)().at(0);
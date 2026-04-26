import _Map from "@core-js/pure/actual/map/constructor";
// variable init wrapped in TS `as` cast: the cast is peeled and the initializer
// expression rewritten in pure-mode.
const x: typeof Map = _Map;
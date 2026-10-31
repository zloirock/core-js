import _Map from "@core-js/pure/actual/map/constructor";
// NEGATIVE: an alias hop CAPTURES its source before the aliasing write - the registered span
// gate must anchor at the hop declarator, where the source still holds undefined
let M2;
M2 = _Map;
import _Map from "@core-js/pure/actual/map/constructor";
// a direct read before the aliasing write keeps the RUNTIME ctor guard: the pre-write
// read falls to the raw member and throws natively, the post-write path gets the polyfill
let M4;
M4 = _Map;
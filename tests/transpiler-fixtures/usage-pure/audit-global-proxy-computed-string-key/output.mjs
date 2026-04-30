import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// computed-string member access on global proxy: globalThis['Map'] / globalThis['Set']
// must resolve identically to dot-form globalThis.Map / globalThis.Set
const m = new _Map();
const s = new _Set();
m.size;
s.size;
// computed-string member access on global proxy: globalThis['Map'] / globalThis['Set']
// must resolve identically to dot-form globalThis.Map / globalThis.Set
const m = new (globalThis['Map'])();
const s = new (globalThis['Set'])();
m.size;
s.size;

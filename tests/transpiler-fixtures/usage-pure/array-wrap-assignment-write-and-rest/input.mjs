// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
let ge, restD, gd, restZ, cr, gb, zn;
([{ Object: { getOwnPropertyNames: ge }, ...restD }] = [kw = (eff('l'), globalThis)]);
([{ Object: { getOwnPropertyDescriptor: gd, ...restZ } }] = [kw = (eff('m'), globalThis), eff('n')]);
([{ Object: { create: cr } }] = [(eff('o'), globalThis), ...xs]);
([{ Map: { groupBy: gb } }, zn] = [kw = (eff('r'), globalThis), 7]);
export { ge, restD, gd, restZ, cr, gb, zn, seen, kw };

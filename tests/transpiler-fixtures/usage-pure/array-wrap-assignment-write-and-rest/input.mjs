// the ASSIGNMENT host with a kept write and a rest: the write stays in the residual, the
// overwrite follows; a sole full consume keeps the RHS as a statement, spread and all; a
// MULTI-element wrapper whose paired element is a kept write keeps the raw destructure and the
// binding takes the ponyfill right after it - the mirror may not replace what the write stores
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

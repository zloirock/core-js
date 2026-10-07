// A fully-consumed static destructure whose receiver buries an effect in a proxy-hop KEY (`globalThis[(eff(),
// 'self')].Array`) keeps the effect - exactly once, ahead of the pure root - and reads no hop, `_globalThis.self`
// being undefined off-browser: in a statement, a for-init sink, behind a sequence, past a static hop, off an
// alias root, at a pure-ctor leaf and inside a LOGICAL operand whose left the build serves (`.Object`, and
// `.Number`, a global core-js extends in place), which leaves the key effect alone.
let a = 0;
let b = 0;
let d = 0;
let e = 0;
let f = 0;
let g = 0;
let i = 0;
let m = 0;
let n = 0;
let p = 0;
let q = 0;
const { from } = globalThis[(a++, 'self')].Array;
from([1]);
for (const { of } = globalThis[(b++, 'self')].Array; false;) of(1);
const { keys } = (d++, globalThis[(e++, 'self')].Object);
keys({});
const { assign } = globalThis.self[(f++, 'window')].Object;
assign({}, { a: 1 });
const { values } = (globalThis[(g++, 'self')].Object) || Object;
values({ x: 1 });
const k = globalThis;
const { entries } = k[(i++, 'self')].Object;
entries({ y: 2 });
const { iterator } = globalThis[(m++, 'self')].Symbol;
iterator;
const { resolve } = globalThis[(n++, 'self')].Promise;
resolve(1);
const al = globalThis;
const { fromEntries } = al.self[(p++, 'window')].Object;
fromEntries([['k', 1]]);
const { getOwnPropertyNames } = (globalThis.self[(q++, 'window')].Object) || Object;
getOwnPropertyNames({ z: 1 });
let r = 0;
const { isInteger } = (globalThis[(r++, 'self')].Number) || Number;
isInteger(1);

// probe corpus of the defense cycles over the destructure wrappers, family "other", part 7:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const c = 1;
const userObj = {};
const arr = [1, 2];
const nb = { y: arr };
const rest = [];
const more = {};
const wrapped = [Object];
const log = [];
const obj = {};
const rows = [];
const k = 'k';
let kw;
const nul = null;
function eff() { return Object; }
function eff2() {}
function mark(t, v) { log.push(t); return v; }

{
const { at: m } = { ...spread, at: 1 }; use(m);
}
{
const { at: m, z } = (mark(), obj); use(m, z);
}
{
const { at: m, z } = eff(), q = 2; use(m, z, q);
}
{
const { at: s, ...r } = eff(), q = 2; s(r, q);
}
{
const { from } = id(Array) ?? {};
}
{
const { from } = pick ? id(Array) : Set;
}
{
const { from: f } = id(Array);
}
{
const { from: f } = pick ? Array : Set;
}
{
const { from: f } = pick ? Array : userObj;
}
{
const { from: f } = pid(Array);
}
{
const { is } = Object; const [{ w: { values }, y: { at } }] = [r, eff('n')]; [is, values, at];
}
{
const { length: { from: f } } = [pick ? Array : userObj];
}
{
const { p: { a, w: { at: m } } } = { p: { a: g(), w: eff() } }; use(a, m);
}
{
const { p: { w: { at: m } }, z } = { p: { w: eff() }, z: 1 }; use(m, z);
}
{
const { q: qq, p: { [(eff.push('key'), 'flat')]: m2, other2 } } = { q: (eff.push('se'), 1), p: holder.p }; use(qq, m2, other2);
}
{
const { root: { Array: { from: f } } } = { root: { Array, ...more } };
}
{
const { w: [{ at }] } = { w: [[1]] };
}
{
const { w: [{ at: m }] } = { w: [[1, 2]] }; use(m);
}
{
const { w: [{ from: f }] } = { w: [pick ? Array : userObj] };
}
{
const { w: [{ from: f }] } = { w: [pick ? Array : userObj] }; log.push(f === Array.from);
}
{
const { w: [{ hasOwn }] } = { w: [Object] };
}
{
const { w: [{ hasOwn }] } = { w: [Object], ...more };
}
{
const { w: [{ hasOwn }] } = { w: [c ? Object : userObj] };
}
{
const { w: { Array: { of: m } }, ...rest } = { w: globalThis, z: 1 }; use(m, rest);
}
{
const { w: { Array: { prototype: { at: m } } }, z } = { z: 1, w: tick('w', globalThis) }; use(m, z);
}
{
const { w: { Array: { prototype: { at: m } } }, z } = { z: tick('z', 1), w: tick('w', globalThis) }; use(m, z);
}
{
const { w: { Array: { prototype: { map: besideSibling } } }, z } = { w: globalThis, z: 5 }; use(besideSibling, z);
}
{
const { w: { Map: M = fb } } = { w: globalThis }; M();
}
{
const { w: { Map: m } } = { ...extra, w: globalThis }; use(m);
}
{
const { w: { Map: m } } = { w: globalThis }; use(m);
}
{
const { w: { Map: m }, ...rest } = { w: globalThis, z: 1 }; use(m, rest);
}
{
const { w: { Map: m }, z } = { w: eff(), z: 1 }; use(m, z);
}
{
const { w: { Map: m, Set: s }, ...rest } = { w: globalThis, z: 1 }; use(m, s, rest);
}
{
const { w: { [(eff('k2'), 'from')]: f }, ...r } = { w: Array };
}
{
const { w: { [Symbol.iterator]: it }, ...rest } = { w: globalThis, z: 1 }; use(it, rest);
}
{
const { w: { at: a } } = { w: [1, 2] };
}
{
const { w: { at: a } } = { w: [1] };
}

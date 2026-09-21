// probe corpus of the defense cycles over the destructure wrappers, family "other", part 6:
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
const { [(eff(), 'w')]: { at: a } } = { w: src };
}
{
const { [(eff(), 'w')]: { at: a2 } } = { w: [1] };
}
{
const { [(eff(), 'w')]: { at: a3 } } = { w: src };
}
{
const { [(eff(), 'w')]: { from: f4 } } = { w: Array };
}
{
const { [(effectful(), 'Array')]: { from: f1 } } = globalThis;
}
{
const { [(k(), 'at')]: s = d, z } = eff(), q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s } = arr; s();
}
{
const { [(k(), 'at')]: s, ...r } = arr; s(r);
}
{
const { [(k(), 'at')]: s, ...r } = eff(), q = 2; s(r, q);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f } = eff(), q = 2; s(f, q);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f } = eff(); s(f);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, ...r } = arr, q = 2; s(r, f, q);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, ...r } = arr; s(r, f);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, ...r } = eff(); s(r, f);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, z } = arr; s(z, f);
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, z } = eff(), q = 2; s(z, q, f);
}
{
const { [(k(), 'at')]: s, z } = [1, 2], q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = arr, q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = arr; s(z);
}
{
const { [(k(), 'at')]: s, z } = c ? a1 : a2, q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = eff(), q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = eff().constructor.prototype, q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = eff(); s(z);
}
{
const { [(k(), 'at')]: s, z } = globalThis.Array.prototype, q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = globalThis.Array.prototype; s(z);
}
{
const { [(k(), 'at')]: s, z } = holder.p, q = 2; s(z, q);
}
{
const { [(k(), 'at')]: s, z } = holder.p; s(z);
}
{
const { [(k(), 'at')]: s, z } = self.Array.prototype; s(z);
}
{
const { [(k(), 'at')]: v, flat: w } = eff(), q = 2; v(w, q);
}
{
const { [(k(), 'at')]: v, flat: w } = eff(); v(w);
}
{
const { [(k(), 'freeze')]: fr, z } = globalThis.Object; fr(z);
}
{
const { a, w: { at: m } } = { a: g(), w: eff() }; use(a, m);
}
{
const { a, w: { at: m } } = { a: g(), w: obj.p }; use(a, m);
}
{
const { a, w: { at: m }, z } = { a: g(), w: eff(), z: 1 }; use(a, m, z);
}
{
const { a: [{ hasOwn }] } = { a: [Object] };
}
{
const { a: eff1 = eff(), w: { from: f } } = { a: undefined, w: pick ? Array : userObj }; log.push(f === Array.from, eff1);
}
{
const { a: { [(eff('k'), 'Array')]: { from: f14 } } } = { a: globalThis };
}
{
const { at: a } = id(arr);
}
{
const { at: m } = (mark(), [1, 2]); use(m);
}

// probe corpus of the defense cycles over the destructure wrappers, family "other", part 4:
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
const k = 'w'; const { [k]: { at: m } } = { w: eff() }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { w: globalThis.arr }; use(m);
}
{
const k = 'w'; let m; ({ [k]: { Map: m } } = { w: globalThis }); use(m);
}
{
const k = 'w'; let m; ({ [k]: { at: m } } = { w: [1, 2] }); use(m);
}
{
const k = 'w'; let m; ({ [k]: { at: m } } = { w: eff() }); use(m);
}
{
const k = 'z'; const wrapper = { w: globalThis, z: [1, 2] }; { const k = 'w'; const { [k]: { Map: m } } = wrapper; use(m); }
}
{
const known = { w: Object, y: [1] }; const [{ w: { is }, y: { at } }] = [known, log.push('s')]; [is, at];
}
{
const m = new (id(Map))();
}
{
const o = { data: [1] }; const r = o[(eff(), 'data')].at(0);
}
{
const q = 1; const [{ w: { values }, y: { at } }] = [r, eff('n')]; [q, values, at];
}
{
const q = 2, { [(k(), 'at')]: s } = eff(); s(q);
}
{
const q = 2, { [(k(), 'at')]: s, z } = eff(); s(z, q);
}
{
const q = eff0(), { [(k(), 'at')]: s } = eff(); s(q);
}
{
const q = eff0(), { [(k(), 'at')]: s, z } = eff(); s(z, q);
}
{
const r = id(Array).from([1]);
}
{
const r = id(arr).at(0) + id(Array).isArray(1);
}
{
const r = id(arr).at(0);
}
{
const r = o[(eff(), 'data')].at(0);
}
{
const r3 = o[(eff(), 's')].at(0);
}
{
const r4 = o[(eff(), E.A)].at(0);
}
{
const r5 = o?.[(eff(), 'data')].at(0);
}
{
const t = typeof Array.prototype.values; const raw = Array.prototype[['val', 'ues'].join('')]; const raw2 = Function('return Array.prototype.values')();
}
{
const v = Object.freeze(Array); v.from([]);
}
{
const { '0': { from: f } } = [pick ? Array : userObj];
}
{
const { 0: { from: f } } = [, pick ? Array : userObj];
}
{
const { 0: { from: f } } = [Array];
}
{
const { 0: { from: f } } = [pick ? Array : userObj];
}
{
const { 1: { from: f } } = [...x, pick ? Array : userObj];
}
{
const { 1: { from: f } } = [0, pick ? Array : userObj];
}
{
const { Array: { [(eff('k'), 'from')]: f6 } } = globalThis;
}
{
const { Array: { [(eff('k2'), 'from')]: f } } = globalThis;
}
{
const { Array: { [(eff('k2'), 'from')]: f }, ...r } = globalThis;
}
{
const { Array: { from } } = id(globalThis);
}
{
const { Array: { from }, ...rest } = globalThis; use(from, rest);
}
{
const { Array: { from: F = fb } } = globalThis; F();
}
{
const { Array: { from: F = fb }, z } = globalThis; F(z);
}
{
const { Array: { from: f }, ...r } = globalThis;
}
{
const { Array: { from: f1 } } = globalThis;
}
{
const { Array: { from: f2 }, ...r2 } = globalThis;
}

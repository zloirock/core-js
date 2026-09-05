// probe corpus of the defense cycles over the destructure wrappers, family "other", part 9:
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
const { w: { from: f } } = { w: pick ? Array : userObj, get w() { return userObj; } };
}
{
const { w: { from: f } } = { w: pick ? Array : userObj, w: Set };
}
{
const { w: { from: f18 }, ...r } = { w: Array };
}
{
const { w: { includes: i5 } } = { w: 'str' };
}
{
const { w: { keys } } = { w: Object }; keys;
}
{
const { w: { keys: f } } = { w: c ? Object : userObj };
}
{
const { x: { [(effectful(), 'from')]: f2 } } = { x: Array }; const doubled = [1, [2]].flat();
}
{
const { y: { at } } = r; at;
}
{
const { y: { at }, ...rest } = r; [at, rest];
}
{
const [{ at: m }] = [eff(), eff2()];
}
{
const [{ w: { values }, y: { at } }] = [r];
}
{
const { [(k(), 'at')]: s = d, z } = eff();
}
{
const { [(k(), 'at')]: s } = eff(), q = 2;
}
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, z } = eff();
}
{
const { [(k(), 'at')]: s, z } = [1, 2];
}
{
const { [(k(), 'at')]: s, z } = arr;
}
{
const { [(k(), 'at')]: s, z } = c ? a1 : a2;
}
{
const { [(k(), 'at')]: s, z } = eff(), q = 2;
}
{
const { [(k(), 'at')]: s, z } = eff();
}
{
const { [(k(), 'at')]: s, z } = holder.p;
}
{
const { [(k(), 'at')]: v, flat: w } = eff();
}
{
const { a: { at: v } } = { a: globalThis.window?.arr };
}
{
const { a: { of: v } } = { a: Array };
}
{
const { a: { of: v } } = { a: c ? globalThis.window?.Array : Set };
}
{
const { a: { of: v } } = { a: globalThis.window.Array };
}
{
const { a: { of: v } } = { a: globalThis.window?.Array };
}
{
const { a: { of: v } } = { a: globalThis.window?.self.Array };
}
{
const { of: v } = globalThis.window?.Array;
}
{
const { w: { at: m }, z } = { w: eff(), z: 1 };
}
{
const { w: { values }, y: { at } } = r;
}
{
if (c) var { at: m, z } = eff(); use(m, z);
}
{
if (c) var { w: { at: m }, z } = { w: eff(), z: 1 }; use(m, z);
}
{
if (c) { const [{ w: { values }, y: { at } }] = [r, eff()]; [values, at]; }
}
{
label: { const [{ w: { values }, y: { at } }] = [r, eff()]; [values, at]; }
}
{
let a; [, { from: a }] = [...rest, Array];
}
{
let a; [{ [(eff('k'), 'w')]: { at: a } }] = [{ w: src }];
}
{
let a; [{ at: a }] = [(log.push('c'), arr)]; use(a);
}
{
let e, k; [{ at: e }, k] = [(g(), f()), 1]; use(e, k);
}

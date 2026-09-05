// probe corpus of the defense cycles over the destructure wrappers, family "other", part 8:
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
const { w: { at: a } } = { w: [1], ...o };
}
{
const { w: { at: a1 } } = { w: [1] };
}
{
const { w: { at: a4 }, ...r } = { w: [1] };
}
{
const { w: { at: f21 }, ...r } = { w: g() };
}
{
const { w: { at: f22 }, ...r } = { w: [1] };
}
{
const { w: { at: m } } = { ...spread, w: [1, 2] }; use(m);
}
{
const { w: { at: m } } = { ...spread, w: arr }; use(m);
}
{
const { w: { at: m } } = { w: (mark(), [1, 2]) }; use(m);
}
{
const { w: { at: m } } = { w: (mark(), arr) }; use(m);
}
{
const { w: { at: m } } = { w: (structuredClone(x), arr) }; use(m);
}
{
const { w: { at: m } } = { w: (x.at(0), arr) }; use(m);
}
{
const { w: { at: m } } = { w: [1, 2] }; use(m);
}
{
const { w: { at: m } } = { w: eff() }; use(m);
}
{
const { w: { at: m }, ...rest } = { w: [1, 2], z: 1 }; use(m, rest);
}
{
const { w: { at: m }, ...rest } = { w: eff(), z: 1 }; use(m, rest);
}
{
const { w: { at: m }, z } = { w: (mark(), arr), z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: [1, 2], z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: [eff()], z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: c ? a : b, z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: eff() ?? [], z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: eff(), z: 1 }, q = 2; use(m, z, q);
}
{
const { w: { at: m }, z } = { w: eff(), z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: obj.p, z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { z: tick('z', 1), w: tick('w', arr) }; use(m, z);
}
{
const { w: { entries } } = { w: Object }; entries;
}
{
const { w: { from: f } = {} } = { w: pick ? Array : userObj };
}
{
const { w: { from: f } = {} } = { w: pick ? undefined : userObj }; log.push(typeof f);
}
{
const { w: { from: f } } = { ...more, w: pick ? Array : userObj };
}
{
const { w: { from: f } } = { get w() { return pick ? Array : userObj; } };
}
{
const { w: { from: f } } = { w: 0 ? Array : userObj }; log.push(f());
}
{
const { w: { from: f } } = { w: Array };
}
{
const { w: { from: f } } = { w: Array, ...o };
}
{
const { w: { from: f } } = { w: pick ? Array : userObj };
}
{
const { w: { from: f } } = { w: pick ? Array : userObj }; log.push(f === Array.from);
}
{
const { w: { from: f } } = { w: pick ? Array : userObj, ...more };
}
{
const { w: { from: f } } = { w: pick ? Array : userObj, ...rest };
}
{
const { w: { from: f } } = { w: pick ? Array : userObj, [k()]: 1 };
}
{
const { w: { from: f } } = { w: pick ? Array : userObj, [k]: 1 };
}

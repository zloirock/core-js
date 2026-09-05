// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 2:
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
for (const { a, w: { at: m } } = { a: g(), w: eff() };;) use(a, m);
}
{
for (const { at: m, z } = eff();;) use(m, z);
}
{
for (const { entries } of [Object, Object]) entries;
}
{
for (const { entries } of [Object]) entries;
}
{
for (const { from } of [Array, Array]) from;
}
{
for (const { from } of [id(Array)]) log.push(from);
}
{
for (const { w: [{ at }] } of [{ w: [[1]] }]) at;
}
{
for (const { w: [{ is } = {}] } of [{ w: [Object] }]) is;
}
{
for (const { w: [{ is }] } of [{ w: [Object] }, { w: [Object] }]) is;
}
{
for (const { w: [{ is }] } of [{ w: [Object] }, { w: [userObj] }]) is;
}
{
for (const { w: [{ is }] } of [{ w: [Object] }]) is;
}
{
for (const { w: [{ is }] } of [{ w: [c ? Object : userObj] }]) is;
}
{
for (const { w: [{ values }] } of [{ w: [Object] }]) values;
}
{
for (const { w: { [(eff(), 'keys')]: k } } of [{ w: Object }, { w: Object }]) k;
}
{
for (const { w: { [Symbol.iterator]: it } } of [{ w: [1] }]) it;
}
{
for (const { w: { at } } of [{ w: [1] }, { w: 's' }]) at;
}
{
for (const { w: { at } } of [{ w: [1] }, { w: [1] }]) at;
}
{
for (const { w: { at } } of [{ w: [1] }, { w: [2] }]) at;
}
{
for (const { w: { at } } of [{ w: [1] }]) at;
}
{
for (const { w: { at: m } } in obj) use(m);
}
{
for (const { w: { at: m }, z } = { w: [1, 2], z: 1 };;) use(m, z);
}
{
for (const { w: { at: m }, z } = { w: eff(), z: 1 }; c;) use(m, z);
}
{
for (const { w: { at: m }, z } = { w: eff(), z: 1 };;) use(m, z);
}
{
for (const { w: { entries = null } } of [{ w: Object }]) entries;
}
{
for (const { w: { entries } } in obj) entries;
}
{
for (const { w: { entries } } of [{ w: Map }]) entries;
}
{
for (const { w: { entries } } of [{ w: Object }, globalThis]) entries;
}
{
for (const { w: { entries } } of [{ w: Object }, { w: Object }]) entries;
}
{
for (const { w: { entries } } of [{ w: Object }, { w: userObj }]) entries;
}
{
for (const { w: { entries } } of [{ w: Object }]) entries;
}
{
for (const { w: { entries } } of [{ w: Object }]) { entries = 1; }
}
{
for (const { w: { entries }, at } of [{ w: Object, at: 1 }, { w: Object, at: 2 }]) [entries, at];
}
{
for (const { w: { entries }, at } of [{ w: Object, at: 1 }]) [entries, at];
}
{
for (const { w: { entries }, y: { at } } of [{ w: Object, y: [1] }]) [entries, at];
}
{
for (const { w: { entries }, z } of [{ w: Object, z: 1 }]) [entries, z];
}
{
for (const { w: { entries, is } } of [{ w: Object }]) [entries, is];
}
{
for (const { w: { flat } } of [{ w: arr }]) flat;
}
{
for (const { w: { getOwnPropertyNames: g } } of [{ w: Object }]) g;
}
{
for (const { w: { is } } of [{ w: (Object) }, { w: Object }]) is;
}
{
for (const { w: { is } } of [{ w: Object }, { w: 1 }]) is;
}

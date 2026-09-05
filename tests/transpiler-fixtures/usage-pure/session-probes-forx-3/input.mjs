// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 3:
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
for (const { w: { is } } of [{ w: Object }, { w: Object }, { w: Object }]) is;
}
{
for (const { w: { is } } of [{ w: Object }, { w: Object }]) is;
}
{
for (const { w: { is }, z } of [{ w: Object, z: 's' }, { w: Object, z: 2 }]) [is, z];
}
{
for (const { w: { is }, z } of [{ w: Object, z: 1 }]) [is, z];
}
{
for (const { w: { is }, z } of [{ w: Object, z: null }, { w: Object, z: true }]) [is, z];
}
{
for (const { w: { keys } = {} } of [{ w: Object }, { w: Object }]) keys;
}
{
for (const { w: { keys } } of [{ ['w']: Object }, { w: Object }]) keys;
}
{
for (const { w: { keys } } of [{ [eff()]: Object }, { [eff()]: Object }]) keys;
}
{
for (const { w: { keys } } of [{ w: (Object) }, { w: Object }]) keys;
}
{
for (const { w: { keys } } of [{ w: Array }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }, { get w() { return Object; } }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }, { v: Object }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }, { w: Array }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }, { w: Object }, { w: Object }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }, { w: Object }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }, { w: Object, ...more }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }]) keys;
}
{
for (const { w: { keys } } of [{ w: Object }]) { const { w: { is } } = _x; }
}
{
for (const { w: { keys } } of [{ w: Object, z: 1 }, { w: Object, z: 2 }]) keys;
}
{
for (const { w: { keys } } of [{ w: globalThis.Object }]) keys;
}
{
for (const { w: { keys } } of rows) keys;
}
{
for (const { w: { keys }, ...rest } of [{ w: Object }, { w: Object }]) keys;
}
{
for (const { w: { x: { entries } } } of [{ w: { x: Object } }]) entries;
}
{
for (const { x } of [...[{ x: [1] }], { x: [2] }]) x.at(0);
}
{
for (let { w: { values }, y: { at } } = r; ;) { [values, at]; break; }
}
{
for (var _r of [{ w: Object }]) { let { w: { keys } } = _r; keys; }
}
{
for (var { w: { entries } } of [{ w: Object }]) entries;
}
{
outer: for (const _r of [{ w: Object }]) { let { w: { keys } } = _r; keys; }
}

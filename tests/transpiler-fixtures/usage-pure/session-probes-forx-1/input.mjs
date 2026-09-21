// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 1:
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
for (const _r of [{ w: Object }]) { let { w: { is } } = _r; is; }
}
{
for (const _r of [{ w: Object }]) { let { w: { keys } } = _r; keys; }
}
{
for (const { is } of [Object, Object]) is;
}
{
for (const { is } of [Object]) is;
}
{
for (const { w: { is } } of [{ w: Object }]) is;
}
{
const arr = [...[[1], [2]]]; for (const e of arr) e.at(0);
}
{
const k = 'w'; for (const { [k]: { at: m } } in obj) use(m);
}
{
const rows = [{ w: Object }]; for (const { w: { is } } of rows) is;
}
{
for (const [[{ at }]] of [[[1]], [[1]]]) at;
}
{
for (const [[{ entries }]] of [[[Object]]]) entries;
}
{
for (const [{ at }] of [[[1]]]) at;
}
{
for (const [{ entries }] of [[Object], [Object]]) entries;
}
{
for (const [{ entries }] of [[Object]]) entries;
}
{
for (const [{ hasOwn }] of [[Object], [, Object]]) hasOwn;
}
{
for (const [{ hasOwn }] of [[Object], [Object]]) hasOwn;
}
{
for (const [{ is }] of [[Object], [Object]]) is;
}
{
for (const [{ is }] of [[Object]]) is;
}
{
for (const [{ keys }] of [[Object], [Object]]) keys;
}
{
for (const [{ values = null }] of [[Object]]) values;
}
{
for (const [{ values }] of [[Object], [userObj]]) values;
}
{
for (const [{ values }] of [[Object]]) values;
}
{
for (const [{ w: { values }, y: { at } }] of [[r]]) [values, at];
}
{
for (const _r in obj) { let { w: { keys } } = _r; keys; }
}
{
for (const _r of [[Object]]) { let [{ values }] = _r; values; }
}
{
for (const _r of [globalThis]) { let { Array: { from } } = _r; from; }
}
{
for (const _r of [{ w: Object }, { w: userObj }]) { let { w: { keys } } = _r; keys; }
}
{
for (const _r of [{ w: Object }]) for (const _s of [_r]) { let { w: { keys } } = _s; keys; }
}
{
for (const _r of [{ w: Object }]) { ({ w: { keys } } = _r); keys; }
}
{
for (const _r of [{ w: Object }]) { const x = 1; let { w: { keys } } = _r; keys; }
}
{
for (const _r of [{ w: Object }]) { const { w: { keys } } = _r; keys; }
}
{
for (const _r of [{ w: Object }]) { let x = _r; let { w: { keys } } = _r; keys; }
}
{
for (const _r of [{ w: Object }]) { let { w: { entries }, ...rest } = _r; entries; }
}
{
for (const _r of [{ w: Object }]) { let { w: { hasOwn } } = _r; hasOwn; }
}
{
for (const _r of [{ w: Object }]) { let { w: { keys } } = _q; keys; }
}
{
for (const _r of [{ w: Object }]) { let { w: { keys } } = _r, other = 1; keys; }
}
{
for (const _r of [{ w: Object }]) { let { w: { keys } } = _r; _r.w = 1; keys; }
}
{
for (const _r of [{ w: Object, y: [1] }]) { let { w: { values }, y: { at } } = _r; [values, at]; }
}
{
for (const { Array: { from } } of [globalThis, { Array }]) from;
}
{
for (const { Object: { keys } } of [{ Object }, { Object }]) keys;
}

// probe corpus of the defense cycles over the destructure wrappers, family "ts", part 2:
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
const { w: { at: m }, z } = { w: eff() as any, z: 1 }; use(m, z);
}
{
for (const [{ from }] of [[...([Array] as any)]]) from;
}
{
for (const { w: { is } } of [{ w: Object as any }, { w: Object }]) is;
}
{
for (const { w: { keys } } of [{ w: Object as any }, { w: Object }]) keys;
}
{
function g([{ from }] = [...([Array] as any)]) { return from; }
}
{
let { w: { values }, y: { at } } = r as any; [values, at];
}
{
o['data' as string] = 'str'; const r1 = o['data' as string].at(0);
}
{
o[E.A as string] = 'str'; const r3 = o[E.A].at(0);
}

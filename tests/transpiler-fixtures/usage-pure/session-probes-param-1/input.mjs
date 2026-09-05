// probe corpus of the defense cycles over the destructure wrappers, family "param", part 1:
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
class C { x = (({ from }) => from)(id(Array)); }
}
{
class K { f = (([{ y: { at: a } }]) => a)([...[nb]]); }
}
{
const boundKey = 'w'; const viaBoundKeyIife = (({ [boundKey]: { at: m } }) => m)({ w: [1, 2] }); use(viaBoundKeyIife);
}
{
const boundKey = 'w'; function boundKeyParam({ [boundKey]: { Map: v } } = { w: globalThis }) { return v; } use(boundKeyParam());
}
{
const f = idd(Array).from; function idd(x) { log.push(x); return x; }
}
{
const nb = { y: [1] }; function g([{ y: { at: a } }] = [...[nb]]) { return a; }
}
{
const order = []; const eff = t => (order.push(t), t); const { [(eff('k'), 'Array')]: { from: f1 } } = globalThis;
}
{
const order = []; const eff = t => (order.push(t), t); const { [(eff('k'), 'Array')]: { prototype: { values: f2 } } } = globalThis;
}
{
const order = []; const eff = t => (order.push(t), t); const { [(eff('k'), 'w')]: { from: f4 } } = { w: Array };
}
{
const order = []; function eff(t) { order.push(t); return t; } const { [(eff('k'), 'at')]: a, z } = [1, 2];
}
{
const q = Object.hasOwn; function g([{ y: { at: a } }] = [...[nb]]) { return a; }
}
{
const r = (([[{ at }]]) => at)([[[1, 2]]]);
}
{
const r = (([[{ hasOwn }]]) => hasOwn)([[Object]]);
}
{
const r = (([{ [Symbol.iterator]: it }]) => it)([[1]]);
}
{
const r = (([{ a: { hasOwn } }]) => hasOwn)([{ a: Object }]);
}
{
const r = (([{ at }, x]) => at)([[1, 2], 0]);
}
{
const r = (([{ at }, { flat }]) => [at, flat])([[1], [[2]]]);
}
{
const r = (([{ at }]) => at)(...[[[1, 2]]]);
}
{
const r = (([{ at }]) => at)([...[[1, 2]]]);
}
{
const r = (([{ at }]) => at)([[1, 2]]);
}
{
const r = (([{ at }]) => at)([arr]);
}
{
const r = (([{ at }]) => at)([c ? [1] : [2]]);
}
{
const r = (([{ at }]) => at)([eff()]);
}
{
const r = (([{ at }]) => at)([globalThis.Array.prototype]);
}
{
const r = (([{ at: a = null }]) => a)([[1]]);
}
{
const r = (([{ from: f }] = [Set]) => f)([pick ? Array : userObj]);
}
{
const r = (([{ from: f }] = [pick ? Array : userObj]) => f)();
}
{
const r = (([{ from: f }]) => f)(...[[pick ? Array : userObj]]);
}
{
const r = (([{ from: f }]) => f)([pick ? Array : userObj]);
}
{
const r = (([{ hasOwn }, { is }]) => [hasOwn, is])([Object, Object]);
}
{
const r = (([{ hasOwn }]) => hasOwn)([Object]);
}
{
const r = (([{ hasOwn }]) => hasOwn)([c ? Object : userObj]);
}
{
const r = (({ [Symbol.iterator]: it }) => it)([1]);
}
{
const r = (({ a: [, { hasOwn }] }) => hasOwn)({ a: [0, Object] });
}
{
const r = (({ a: [[{ hasOwn }]] }) => hasOwn)({ a: [[Object]] });
}
{
const r = (({ a: [{ [Symbol.iterator]: i1 }], b: [{ [Symbol.iterator]: i2 }] }) => [i1, i2])({ a: [[1]], b: ['s'] });
}
{
const r = (({ a: [{ at }] }) => at)({ a: [[1, 2]] });
}
{
const r = (({ a: [{ at }] }) => at)({ a: [[1]] });
}
{
const r = (({ a: [{ b: { hasOwn } }] }) => hasOwn)({ a: [{ b: Object }] });
}
{
const r = (({ a: [{ hasOwn }, { is }] }) => [hasOwn, is])({ a: [Object, Object] });
}

// probe corpus of the defense cycles over the destructure wrappers, family "param", part 2:
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
const r = (({ a: [{ hasOwn }] }) => hasOwn)({ a: [Object] });
}
{
const r = (({ a: [{ hasOwn }] }) => hasOwn)({ a: [c ? Object : userObj] });
}
{
const r = (({ a: [{ hasOwn }], b: [{ is }] }) => [hasOwn, is])({ a: [Object], b: [Object] });
}
{
const r = (({ a: { [Symbol.iterator]: it } }) => it)({ a: [1] });
}
{
const r = (({ a: { [Symbol.iterator]: it, at } }) => [it, at])({ a: [1] });
}
{
const r = (({ a: { at } }) => at)({ a: [1, 2] });
}
{
const r = (({ a: { b: { hasOwn } } }) => hasOwn)({ a: { b: Object } });
}
{
const r = (({ a: { hasOwn } }) => hasOwn)({ a: Object });
}
{
const r = (({ a: { hasOwn }, b: { is } }) => [hasOwn, is])(globalThis.x);
}
{
const r = (({ a: { hasOwn }, b: { is } }) => [hasOwn, is])({ a: Object, b: Object });
}
{
const r = (({ a: { hasOwn }, b: { is } }) => [hasOwn, is])({ a: Object, b: userObj });
}
{
const r = (({ a: { hasOwn }, b: { is } }) => [hasOwn, is])({ a: c ? Object : userObj, b: Object });
}
{
const r = (({ a: { hasOwn, is } }) => [hasOwn, is])({ a: Object });
}
{
const r = (({ at }) => at)((0, [1, 2]));
}
{
const r = (({ at }) => at)((log(), [1, 2]));
}
{
const r = (({ at }) => at)(...[[1, 2]]);
}
{
const r = (({ at }) => at)([1, 2]);
}
{
const r = (({ at }, x) => at)(...[[1, 2], 0]);
}
{
const r = (({ from }) => from)(...([Array]));
}
{
const r = (({ from }) => from)(id(Array));
}
{
const r = (({ w: [{ [Symbol.iterator]: it, hasOwn }] }) => [it, hasOwn])({ w: [Object] });
}
{
const r = (({ w: [{ hasOwn } = {}] }) => hasOwn)({ w: [Object] });
}
{
const r = (({ w: [{ hasOwn }, ...rest] }) => hasOwn)({ w: [Object, 1] });
}
{
const r = (({ w: [{ hasOwn }] = [] }) => hasOwn)({ w: [Object] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ get w() { return [Object]; } });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [...[Object]] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [...rest, Object] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [Object, eff()] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [Object] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [Object], w: [userObj] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [eff(), Object] });
}
{
const v = (({ at }) => at)(...[mark('e', [0])]);
}
{
const v = (({ at }) => at)(mark('e', [0]));
}
{
const v = (({ at }, x) => at)(mark('e', [0]), 1);
}
{
const v = Promise.resolve(...[[1, 2]]); v.then(a => a.at(0));
}
{
const viaIife = (({ at }, x) => [at.call([8, 9], -1), x])(...[mark('e', [0]), mark('f', 1)]);
}
{
function f() { const [{ w: { values }, y: { at } }] = [r, eff('n')]; return [values, at]; }
}
{
function f(a = [1]) { return a; } const v = f(...[[1, 2]]); v.at(0);
}
{
function f(a = [1]) { return a; } const v = f(...rest); v.at(0);
}

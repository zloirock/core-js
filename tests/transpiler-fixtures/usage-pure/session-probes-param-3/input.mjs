// probe corpus of the defense cycles over the destructure wrappers, family "param", part 3:
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
function f({ at } = arr) { return at; }
}
{
function f({ from } = ((x) => (log.push('x'), x))(Array)) { return from; }
}
{
function f({ from } = Array) { return from; }
}
{
function f({ from } = id(Array)) { return from; }
}
{
function f({ from } = id(Array), y = 1) { return from; }
}
{
function f({ x }) { return x; } const v = f(...[{ x: [1] }]); v.at(0);
}
{
function f({ x }) { return x; } const v = f(...rest); v.at(0);
}
{
function fromArr([{ from } = {}] = [Array]) { return from; }
}
{
function g([{ [Symbol.iterator]: it }] = [[1]]) { return it; }
}
{
function g([{ at }] = [[1, 2]]) { return at; }
}
{
function g([{ at }] = [arr]) { return at; }
}
{
function g([{ from: f } = {}] = [pick ? Array : userObj]) { return f; }
}
{
function g([{ from: f }] = [Array]) { return f; }
}
{
function g([{ from: f }] = [pick ? Array : userObj]) { return f; }
}
{
function g([{ hasOwn }, { is }] = [Object, Object]) { return [hasOwn, is]; }
}
{
function g([{ hasOwn }] = [Object]) { return hasOwn; }
}
{
function g([{ y: { at: a } }] = [...[nb]]) { return a; }
}
{
function g(a = 's') { a.at(0); } g(...[[1]]);
}
{
function g(a = 's') { a.at(0); } g(...rest);
}
{
function g(a = [1]) { a.at(0); } g();
}
{
function g(a = [1]) { a.at(0); } g(...[[1]]);
}
{
function g(a = [1]) { a.at(0); } g([1]);
}
{
function g(a) { a.at(0); } g(...[[1]]);
}
{
function g(a) { a.at(0); } g([1]);
}
{
function g({ [(eff('k'), 'Array')]: { from: f10 } } = globalThis) { return f10; }
}
{
function g({ a: [{ hasOwn }] } = { a: [Object] }) { return hasOwn; }
}
{
function g({ a: { hasOwn }, b: { keys } } = { a: Object, b: Object }) { return [hasOwn, keys]; }
}
{
function g({ from: f } = pick ? Array : userObj) { return f; }
}
{
function g({ w: [{ hasOwn } = {}] = [] } = { w: [Object] }) { return hasOwn; }
}
{
function g({ w: { from: f } } = { w: pick ? Array : userObj }) { return f; } log.push(g() === Array.from, g({ w: userObj })());
}
{
function k(key) { const { w: { Map: kd } } = { w: globalThis, [key]: other }; return kd; }
}
{
function key() { return 'k'; } const { m: { at }, [key()]: picked } = { m: [1], k: 2 };
}
{
function mark() {} const viaSeqArg = (({ at: m }) => m)((mark(), [1, 2])); use(viaSeqArg);
}
{
function p({ w: { at: m } } = { w: 'ab' }) { use(m); } p();
}
{
let pick = 1; const userObj = {}; function g([{ from: f }] = [pick ? Array : userObj]) { return f; }
}

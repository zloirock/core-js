// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
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
({ w: { from: f } } = { w: pick ? Array : userObj });
}
{
const { is } = Object; is;
}
{
[{ from: f }] = [pick ? Array : userObj];
}
{
class C1 { constructor([{ from: f }] = [pick ? Array : userObj]) { this.f = f; } } log.push(new C1().f === Array.from, new C1([userObj]).f());
}
{
class C5 { static { const [{ from: f }] = [pick ? Array : userObj]; C5.f = f; } } log.push(C5.f === Array.from);
}
{
const [, [{ at }]] = [...rest, [[1]]];
}
{
const [, { Map: M }] = [...rest, globalThis]; new M();
}
{
const [, { at }] = [...rest, [1]];
}
{
const [, { at: ci }] = [eff(), getArr()]; use(ci);
}
{
const [, { at: m }, z] = [eff0(), eff(), 1]; use(m, z);
}
{
const [, { at: m }] = [eff0(), eff()]; use(m);
}
{
const [, { from: f }] = [, pick ? Array : userObj];
}
{
const [, { from: f }] = [...rest, Array];
}
{
const [, { from: f }] = [eff(), Array];
}
{
const [, { from: f }] = [eff(), pick && Array];
}
{
const [, { from: f }] = [eff(), pick ? Array : userObj];
}
{
const [, { w: { values }, y: { at } }] = [eff(), r]; [values, at];
}
{
const [, { y: { at: ci } }] = [eff(), { y: (mark(), getArr()) }]; use(ci);
}
{
const [, { y: { at: ci } }] = [eff(), { y: arr }]; use(ci);
}
{
const [, { y: { at: ci } }] = [eff(), { y: getArr() }]; use(ci);
}
{
const [[{ from: f }]] = [...rest, [Array]];
}
{
const [[{ from: f }]] = [[pick ? Array : userObj]];
}
{
const [[{ w: { values }, y: { at } }]] = [[r]]; [values, at];
}
{
const [{ Array: { from: f } } = {}] = [pick ? globalThis : Set];
}
{
const [{ Array: { from: f } }] = [pick ? globalThis : Set];
}
{
const [{ [Symbol.iterator]: it }] = [[1]];
}
{
const [{ a }, { at: m }] = [g(), eff()]; use(a, m);
}
{
const [{ a: [{ hasOwn }] }] = [{ a: [Object] }];
}
{
const [{ assign }] = [, Object];
}
{
const [{ at }] = [, [1, 2]];
}
{
const [{ at }] = [...rest, [1, 2]];
}
{
const [{ at }] = [...rest, [1]];
}
{
const [{ at }] = [[1, 2]];
}
{
const [{ at }] = [[1], eff()];
}
{
const [{ at }] = [[eff()], ...rest];
}
{
const [{ at: a }, { from: f }] = [arr, pick ? Array : userObj]; log.push(f === Array.from, typeof a);
}
{
const [{ at: a }] = [eff()];
}

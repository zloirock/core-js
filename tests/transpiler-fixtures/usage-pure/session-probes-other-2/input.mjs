// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
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
const [{ at: a }] = [pick ? [1] : 'x'];
}
{
const [{ at: ci }] = [getArr(), eff2()]; use(ci);
}
{
const [{ at: m }, other] = [eff(), eff2()]; use(m, other);
}
{
const [{ at: m }, z] = [eff(), 1]; use(m, z);
}
{
const [{ at: m }] = [arr, eff2()]; use(m);
}
{
const [{ at: m }] = [eff(), eff2()], z = 1; use(m, z);
}
{
const [{ at: m }] = [eff(), eff2()]; use(m);
}
{
const [{ from: f } = {}] = [Array];
}
{
const [{ from: f } = {}] = [pick ? Array : Set];
}
{
const [{ from: f } = {}] = [pick ? Array : userObj];
}
{
const [{ from: f }, x] = [pick ? Array : Set, 1];
}
{
const [{ from: f }, z] = [pick ? Array : userObj, eff()];
}
{
const [{ from: f }, { Map: M }] = [pick ? Array : userObj, globalThis]; log.push(f === Array.from, typeof M);
}
{
const [{ from: f }, { at: a }] = [pick ? Array : userObj, arr]; log.push(f === Array.from, typeof a);
}
{
const [{ from: f }] = [(mark++, pick ? Array : userObj)];
}
{
const [{ from: f }] = [...wrapped];
}
{
const [{ from: f }] = [Array, eff()];
}
{
const [{ from: f }] = [Array];
}
{
const [{ from: f }] = [c ? Array : userObj];
}
{
const [{ from: f }] = [g];
}
{
const [{ from: f }] = [pick && Array];
}
{
const [{ from: f }] = [pick ? (mark++, Array) : userObj];
}
{
const [{ from: f }] = [pick ? Array : Object];
}
{
const [{ from: f }] = [pick ? Array : Set];
}
{
const [{ from: f }] = [pick ? Array : userObj, eff()];
}
{
const [{ from: f }] = [pick ? Array : userObj];
}
{
const [{ from: f }] = [pick ? Set : Array];
}
{
const [{ from: f }] = [pick ? globalThis : Set];
}
{
const [{ from: f }] = [pick ? globalThis.Array : Set];
}
{
const [{ from: f, at: a }] = [pick ? Array : userObj]; log.push(f === Array.from, typeof a);
}
{
const [{ isArray: f }] = [pick ? Array : Set];
}
{
const [{ w: [{ hasOwn }] }] = [{ w: [Object] }];
}
{
const [{ w: { at: m } }] = [{ w: (mark(), arr) }]; use(m);
}
{
const [{ w: { at: m } }] = [{ w: arr }, eff2()]; use(m);
}
{
const [{ w: { at: m } }] = [{ w: eff() }, eff2()]; use(m);
}
{
const [{ w: { from: f } }] = [{ w: pick ? Array : userObj }];
}
{
const [{ w: { keys } }] = [r]; const [{ w: { values }, y: { at } }] = [r, eff('n')]; [keys, values, at];
}
{
const [{ w: { values } }] = [r, eff('n')]; values;
}
{
const [{ w: { values }, y: { at } }, x] = [r, 1]; [values, at, x];
}
{
const [{ w: { values }, y: { at } }] = [(eff(), r)]; [values, at];
}

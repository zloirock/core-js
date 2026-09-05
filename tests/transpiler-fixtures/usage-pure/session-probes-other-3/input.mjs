// probe corpus of the defense cycles over the destructure wrappers, family "other", part 3:
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
const [{ w: { values }, y: { at } }] = [eff(), r][1]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, , eff()]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, ...rest]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; const [{ w: { keys } }] = [r]; [values, at, keys];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; const [{ w: { keys }, y: { flat } }] = [r, eff('m')]; [values, at, keys, flat];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; const q = 1; [values, at, q];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')];
}
{
const [{ w: { values }, y: { at } }] = [r, eff(), eff2()]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff()]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r]; [values, at];
}
{
const [{ w: { values, is }, y: { at } }] = [r, eff('n')]; [values, is, at];
}
{
const [{ y: { at } }] = [r, eff('n')]; at;
}
{
const [{ y: { at } }] = [r]; at;
}
{
const [{ y: { at: ci } }] = [{ y: getArr() }]; use(ci);
}
{
const _r = { w: Object }; let { w: { keys } } = _r; keys;
}
{
const box = [1]; const [a] = [...rest, box]; a.push(2); box.at(0);
}
{
const box = [1]; const [a] = [box]; a.push(2); box.at(0);
}
{
const box = [[1]]; box[0].at(0);
}
{
const box = [[1]]; const [a] = [...rest, box]; a.push('s'); box[0].at(0);
}
{
const box = [[1]]; const [a] = [box]; a.push('s'); box[0].at(0);
}
{
const f = (id(Array)).from; const g = (0, id)(Array).from;
}
{
const f = id(Array).from;
}
{
const f = id(Array, log.push(2)).from;
}
{
const f = id?.(Array).from;
}
{
const host = ([{ from: f }] = [pick ? Array : userObj]);
}
{
const host = ({ w: { from: f } } = { w: pick ? Array : userObj });
}
{
const k = 'Map'; const { [k]: m } = globalThis; use(m);
}
{
const k = 'Map'; const { w: { [k]: m } } = { w: globalThis }; use(m);
}
{
const k = 'at'; const { [k]: m } = [1, 2]; use(m);
}
{
const k = 'of'; const { [k]: f } = Array; use(f);
}
{
const k = 'w'; const [{ [k]: { at: m } }] = [{ w: [1, 2] }]; use(m);
}
{
const k = 'w'; const { [k]: [{ at: m }] } = { w: [[1, 2]] }; use(m);
}
{
const k = 'w'; const { [k]: { Array: { of: m } } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const { [k]: { Map: m } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const { [k]: { Map: m } } = { w: globalThis, z: other }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { ...spread, w: [1, 2] }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { w: [1, 2] }; use(m);
}

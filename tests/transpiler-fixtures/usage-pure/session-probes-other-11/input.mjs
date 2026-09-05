// probe corpus of the defense cycles over the destructure wrappers, family "other", part 11:
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
try { throw { w: [1] }; } catch ({ [(eff('k'), 'w')]: { at: a } }) { a; }
}
{
try { throw { w: [1] }; } catch ({ [(eff('k'), 'w')]: { at: a } }) { log.push(a.call([5], 0)); }
}
{
var [{ w: { values }, y: { at } }] = [r, eff()]; [values, at];
}
{
var t = 0, { [(k++, 'at')]: a } = [1];
}
{
var { [(k++, 'at')]: a } = [1], t = 0;
}

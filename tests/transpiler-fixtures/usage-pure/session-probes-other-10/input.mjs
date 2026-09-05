// probe corpus of the defense cycles over the destructure wrappers, family "other", part 10:
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
let e; [{ at: e }] = [(g(), arr)]; use(e);
}
{
let e; [{ at: e }] = [(g(), f())]; use(e);
}
{
let e; [{ at: e }] = [(x.at(0), f())]; use(e);
}
{
let f17; ({ [(eff('k'), 'w')]: { at: f17 } } = { w: [1] });
}
{
let f3; ({ w: { from: f3 } } = { w: Array, ...o });
}
{
let f4; ({ Array: { from: f4 }, ...r4 } = globalThis);
}
{
let f9; ({ [(eff('k'), 'Array')]: { from: f9 } } = globalThis);
}
{
let f; ({ w: { from: f } } = { w: pick ? Array : userObj });
}
{
let f; [{ from: f }] = [pick ? Array : userObj];
}
{
let from, rest; ({ Array: { from }, ...rest } = globalThis); use(from, rest);
}
{
let from; ({ from } = id(Array));
}
{
let hopSeq; ({ w: { Array: { from: hopSeq } } } = { w: (f(), (g(), globalThis)) }); use(hopSeq);
}
{
let m, rest; ({ Map: m, ...rest } = globalThis); use(m, rest);
}
{
let m, rest; ({ w: { Map: m }, ...rest } = { w: globalThis, z: 1 }); use(m, rest);
}
{
let m, rest; ({ w: { at: m }, ...rest } = { w: [1, 2], z: 1 }); use(m, rest);
}
{
let m, z; ({ w: { at: m }, z } = { w: eff(), z: 1 }); use(m, z);
}
{
let m; ([{ w: { at: m } }] = [{ w: (mark(), arr) }]); use(m);
}
{
let m; ([{ w: { at: m } }] = [{ w: (x.at(0), arr) }]); use(m);
}
{
let m; ({ w: { at: m } } = { w: (mark(), arr) }); use(m);
}
{
let m; ({ w: { at: m } } = { w: eff() }); use(m);
}
{
let out, e; ([{ at: e }] = [(out = 1, arr).flat()]); use(e, out);
}
{
let out, e; [{ at: e }] = [(out = 1, arr)]; use(e, out);
}
{
let out, e; [{ at: e }] = [(out = 1, arr.flat())]; use(e, out);
}
{
let out, e; [{ at: e }] = [(out = 1, f())]; use(e, out);
}
{
let v, a; ({ w: { values: v }, y: { at: a } } = r); [v, a];
}
{
let v; ({ w: [{ entries: v }] } = { w: [Object] });
}
{
let { w: { values }, y: { at } } = eff(); [values, at];
}
{
let { w: { values }, y: { at } } = r ?? {}; [values, at];
}
{
let { w: { values }, y: { at } } = r; [values, at];
}
{
let { y: { at } } = r, z = 1; [at, z];
}
{
let { y: { at } } = r; at;
}
{
o[(eff(), 'data')] = 'str'; const r2 = o.data.at(0);
}
{
o[(eff(), 'data')] = 'str'; const r2 = o[(eff(), 'data')].at(0);
}
{
try { throw 0; } catch (_r) { let { w: { keys } } = _r; keys; }
}
{
try { throw 0; } catch ({ [(eff('k'), 'Array')]: { from: f } = globalThis }) { f; }
}
{
try { throw 0; } catch ({ w: { entries } }) { entries; }
}
{
try { throw [r]; } catch ([{ w: { values }, y: { at } }]) { [values, at]; }
}
{
try { throw { w: Array }; } catch ({ [(eff('k'), 'w')]: { from: f } }) { f; }
}
{
try { throw { w: Array }; } catch ({ [(eff('k'), 'w')]: { from: f } }) { log.push(f === Array.from); }
}

// probe corpus of the defense cycles over the destructure wrappers, family "spread", part 1:
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
const [, { Map: M }] = [...[0, globalThis]]; new M();
}
{
const [, { at }] = [...[eff(), [1]]];
}
{
const [, { from: f }] = [...[0, Array]];
}
{
const [, { from: f }] = [...[0], pick ? Array : userObj];
}
{
const [[x]] = [...[[[1]]]]; x.at(0);
}
{
const [[{ at }]] = [...[[...[[1, 2]]]]];
}
{
const [[{ at }]] = [[...[[1, 2]]]];
}
{
const [[{ from: f }]] = [...[[...[Array]]]];
}
{
const [[{ from: f }]] = [...[[...[Object]]]];
}
{
const [a = [1]] = [...[[2]]]; a.at(0);
}
{
const [a = [1]] = [...[undefined]]; a.at(0);
}
{
const [x] = [...[[1, 2]], eff()]; x.at(0);
}
{
const [x] = [...[[1]], ...rest]; x.at(0);
}
{
const [{ Map: M }] = [...[globalThis]]; new M();
}
{
const [{ assign }] = [...[, Object]];
}
{
const [{ at }] = [...[, [1, 2]]];
}
{
const [{ at }] = [...[, [1]]];
}
{
const [{ at }] = [...[[1, 2]], eff()];
}
{
const [{ at }] = [...[[1, 2]]];
}
{
const [{ at }] = [...[[1]], eff()];
}
{
const [{ at: a }] = [...[[1]]];
}
{
const [{ from: f }] = [...([Array])];
}
{
const [{ from: f }] = [...[, Array]];
}
{
const [{ from: f }] = [...[...[Array]]];
}
{
const [{ from: f }] = [...[0, pick ? Array : userObj]];
}
{
const [{ from: f }] = [...[0], Array];
}
{
const [{ from: f }] = [...[Array, ...rest]];
}
{
const [{ from: f }] = [...[Array]], [{ z }] = [...[nb]];
}
{
const [{ from: f }] = [...[Array]];
}
{
const [{ from: f }] = [...[]] ;
}
{
const [{ from: f }] = [...[pick ? Array : userObj]];
}
{
const box = [1]; const [, ...r] = [...[0, box]]; r[0].push(2); box.at(0);
}
{
const box = [1]; const [a] = [...[box]]; a.push(2); box.at(0);
}
{
const box = [[1]]; const [, ...r] = [...[0, box]]; r[0].push('s'); box[0].at(0);
}
{
const box = [[1]]; const [a] = [...[box]]; a.push('s'); box[0].at(0);
}
{
const o = { a: [...[[1]]] }; o.a[0].at(0);
}
{
const v = Object.freeze(...[Array]); v.from([]);
}
{
const v = Object.freeze(...[[1, 2]]); v.at(0);
}

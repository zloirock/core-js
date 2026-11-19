// a CONTAINER-literal default ABOVE the leaf's level (`= { B: Map }`, `= [Object]`) holds the value
// the static is read through where the default fires: the read takes its polyfill off the literal's
// slot at any depth, beside a sibling, in a declaration, an assignment, a parameter, a loop head and a
// catch clause, and a named container default is read whole, its own declaration left as written
function h1(o) { const { A: { B: { groupBy: s } } = { B: Map } } = o; return s; }
const { A: { B: { try: t2 } } = { B: Promise } } = {};
function h3(o) { const { A: { B: { C: { from: f } } } = { B: { C: Iterator } } } = o; return f; }
function h4(o) { const { A: [{ fromEntries: e }] = [Object] } = o; return e; }
function h5(o) { const { A: { B: { withResolvers: w, name: nm } } = { B: Promise } } = o; return [w, nm]; }
function h6(o) { let c; ({ A: { B: { concat: c } } = { B: Iterator } } = o); return c; }
function h7({ A: { B: { fromAsync: a } } = { B: Array } } = {}) { return a; }
function h8(o) { const { A: { B: { at } } = { B: [1, 2] } } = o; return at; }
for (const { A: { B: { sumPrecise: sp } } = { B: Math } } of [{}]) use(sp);
try { throw {}; } catch ({ A: { B: { isError: ie } } = { B: Error } }) { use(ie); }
const G = [Array];
function h11(o) { const { A: [{ of: so }] = G } = o; return so; }
use(h1, t2, h3, h4, h5, h6, h7, h8, h11);

// A fully-consumed static destructure whose receiver buries a side effect in a proxy-hop KEY
// (`globalThis[(eff(), 'self')].Array`): the effect must run, so the consumed receiver survives as a
// residual, and its redundant `.self` hop MUST collapse - `_globalThis.self` is undefined off-engine
// (ie:11 / Node), so keeping the hop reads it raw and crashes. drop the hop + harvest the buried key
// effect ahead of the pure root, matching babel. covers the leading-statement residual (block decl), the
// for-init SINK residual (receiver kept under a synthesized declarator), and a sequence-rooted receiver
// (`(eff(), globalThis[(eff(), 'self')].Object)`) where the peel must reach the inner member through the tail.
// also a STATIC hop (`.self`) ahead of the computed-effect hop: BOTH must collapse, and the single-hop
// retained-default path must NOT also fire (two overlapping transforms on the residual would compose-crash).
// also the proxy receiver inside a LOGICAL operand (`(globalThis[(eff(), 'self')].Object) || Object`, the
// residual keeps the whole logical for the effect) and rooted in an ALIAS of a proxy global (`const k =
// globalThis; k[(eff(), 'self')].Object`, never visited as a literal proxy root) - both collapse the same way.
// also a PURE-CTOR leaf (`globalThis[(eff(), 'self')].Symbol` / `.Promise`, fully consumed by a static/symbol
// synth-swap): the receiver whole-swaps to the pure ctor (`(eff(), _Symbol)`) and the SHARED resolver must
// harvest the buried hop-key effect EXACTLY once ahead of it - not drop it (a SE-loss) nor re-run it (double).
// also a MIXED static+SE hop (`g.self[(eff(), 'window')].Object`) rooted in an ALIAS, and the same inside a
// LOGICAL operand: collapseProxyHopRoot fully owns it, so the single-hop static-delete default must stand down
// (running both queues two overlapping transforms - a stale `.self` needle nested in the collapse - and crashes)
let a = 0;
let b = 0;
let d = 0;
let e = 0;
let f = 0;
let g = 0;
let i = 0;
let m = 0;
let n = 0;
let p = 0;
let q = 0;
const { from } = globalThis[(a++, 'self')].Array;
from([1]);
for (const { of } = globalThis[(b++, 'self')].Array; false;) of(1);
const { keys } = (d++, globalThis[(e++, 'self')].Object);
keys({});
const { assign } = globalThis.self[(f++, 'window')].Object;
assign({}, { a: 1 });
const { values } = (globalThis[(g++, 'self')].Object) || Object;
values({ x: 1 });
const k = globalThis;
const { entries } = k[(i++, 'self')].Object;
entries({ y: 2 });
const { iterator } = globalThis[(m++, 'self')].Symbol;
iterator;
const { resolve } = globalThis[(n++, 'self')].Promise;
resolve(1);
const al = globalThis;
const { fromEntries } = al.self[(p++, 'window')].Object;
fromEntries([['k', 1]]);
const { getOwnPropertyNames } = (globalThis.self[(q++, 'window')].Object) || Object;
getOwnPropertyNames({ z: 1 });

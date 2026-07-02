import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
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
(a++, _globalThis).Array;
const from = _Array$from;
from([1]);
for (const _ref = (b++, _globalThis).Array, of = _Array$of; false;) of(1);
(d++, (e++, _globalThis).Object);
const keys = _Object$keys;
keys({});
(f++, _globalThis).Object;
const assign = _Object$assign;
assign({}, { a: 1 });
((g++, _globalThis).Object) || Object;
const values = _Object$values;
values({ x: 1 });
const k = _globalThis;
(i++, _globalThis).Object;
const entries = _Object$entries;
entries({ y: 2 });
(m++, _Symbol);
const iterator = _Symbol$iterator;
iterator;
(n++, _Promise);
const resolve = _Promise$resolve;
resolve(1);
const al = _globalThis;
(p++, _globalThis).Object;
const fromEntries = _Object$fromEntries;
fromEntries([['k', 1]]);
((q++, _globalThis).Object) || Object;
const getOwnPropertyNames = _Object$getOwnPropertyNames;
getOwnPropertyNames({ z: 1 });
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A fully-consumed static destructure whose receiver buries an effect in a proxy-hop KEY (`globalThis[(eff(),
// 'self')].Array`) keeps the effect - exactly once, ahead of the pure root - and reads no hop, `_globalThis.self`
// being undefined off-browser: in a statement, a for-init sink, behind a sequence, past a static hop, off an
// alias root, at a pure-ctor leaf and inside a LOGICAL operand whose left the build serves (`.Object`, and
// `.Number`, a global core-js extends in place), which leaves the key effect alone.
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
a++;
const from = _Array$from;
from([1]);
for (const of = (b++, _Array$of); false;) of(1);
d++, e++;
const keys = _Object$keys;
keys({});
f++;
const assign = _Object$assign;
assign({}, {
  a: 1
});
g++;
const values = _Object$values;
values({
  x: 1
});
const k = _globalThis;
i++;
const entries = _Object$entries;
entries({
  y: 2
});
m++;
const iterator = _Symbol$iterator;
iterator;
n++;
const resolve = _Promise$resolve;
resolve(1);
const al = _globalThis;
p++;
const fromEntries = _Object$fromEntries;
fromEntries([['k', 1]]);
q++;
const getOwnPropertyNames = _Object$getOwnPropertyNames;
getOwnPropertyNames({
  z: 1
});
let r = 0;
r++;
const isInteger = _Number$isInteger;
isInteger(1);
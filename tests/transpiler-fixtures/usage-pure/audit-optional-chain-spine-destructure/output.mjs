import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// a destructure whose RECEIVER spine wears an optional-chain marker: on ESTree the marker is a
// node the receiver questions meet before anything else, and peeling it or not is the whole
// difference between the two wrapper sets the extraction asks through. every row keeps a
// distinct spine shape - an SE computed hop key, a nested pattern with a surviving residual,
// a plain hop, a paren-sealed hop, a defaulted leaf, an array pattern, a rest sibling, a
// write-rooted spine and a call-rooted one. the emitters agree on the extraction and part
// only where they already do off the marker: the key effect's placement (a comma inside the
// value vs a hoisted statement) and the dead receiver read the babel leg keeps
let c = 0;
const iterator = (c++, _Symbol$iterator);
export const r1 = [typeof iterator, c];
let d = 0;
const resolve = _Promise$resolve;
const {
  other
} = (d++, _self);
export const r2 = [typeof resolve, typeof other, d];
const of = _Array$of;
export const r3 = typeof of;
const entries = _Object$entries;
export const r4 = typeof entries;
let e = 0;
e++;
const groupBy = _Map$groupBy;
export const r5 = [typeof groupBy, e];
const flat = (_ref = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? null : _ref;
export const r6 = typeof flat;
const [head] = _Array$of(1, 2);
export const r7 = head;
const from = _Array$from;
const {
  from: _unused,
  ...restOfArray
} = _globalThis.Array;
export const r8 = [typeof from, typeof restOfArray];
let u;
(u = _self).Object;
const fromEntries = _Object$fromEntries;
export const r9 = [typeof fromEntries, typeof u];
function mk() {
  return _globalThis;
}
_self.Object;
const assign = _Object$assign;
export const r10 = typeof assign;
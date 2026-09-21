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
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let c = 0;
const {
  Symbol: {
    iterator
  }
} = (c++, _self, {
  Symbol: {
    iterator: _Symbol$iterator
  }
});
export const r1 = [typeof iterator, c];
let d = 0;
const {
  Promise: {
    resolve
  },
  other
} = (d++, _self, {
  Promise: {
    resolve: _Promise$resolve
  },
  other: _self.other
});
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
const _ref2 = _self.Array,
  from = null == _ref2 ? _ref2[""] : _Array$from,
  {
    from: _unused,
    ...restOfArray
  } = _ref2;
export const r8 = [typeof from, typeof restOfArray];
let u;
u = _self;
const fromEntries = _Object$fromEntries;
export const r9 = [typeof fromEntries, typeof u];
function mk() {
  return _globalThis;
}
const assign = _Object$assign;
export const r10 = typeof assign;
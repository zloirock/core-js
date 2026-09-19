import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a receiver-less static under a MULTI-element wrapper of an assignment: a mirror literal in the
// element's place would replace a value the other slots still read, so the raw destructure stays
// and the binding takes the ponyfill right after
let f;
let x;
let k;
let stored;
[{
  Array: {
    from: f
  }
}, x] = [_globalThis, 1];
f = _Array$from;
[{
  Map: {
    groupBy: k
  }
}, stored] = [_globalThis, 7];
k = _Map$groupBy;
export const r = [typeof f, x, typeof k, stored];
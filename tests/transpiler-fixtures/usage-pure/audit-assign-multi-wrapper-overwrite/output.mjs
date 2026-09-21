import _Array$from from "@core-js/pure/actual/array/from";
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
}, x] = [{
  Array: {
    from: _Array$from
  }
}, 1];
[{
  Map: {
    groupBy: k
  }
}, stored] = [{
  Map: {
    groupBy: _Map$groupBy
  }
}, 7];
export const r = [typeof f, x, typeof k, stored];
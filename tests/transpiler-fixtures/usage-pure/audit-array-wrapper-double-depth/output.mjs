import _Array$from from "@core-js/pure/actual/array/from";
// 2-level ArrayPattern wrapping with const-aliased wrapper. Walks two ArrayPattern hops
// to reach `Array`, descending the wrapper's init ArrayExpression at each depth
const wrapper = [[Array]];
const [[_ref]] = wrapper;
const {
  from: _unused
} = _ref;
const from = _Array$from;
from([1, 2, 3]);
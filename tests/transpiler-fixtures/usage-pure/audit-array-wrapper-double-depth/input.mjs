// 2-level ArrayPattern wrapping with const-aliased wrapper. Walks two ArrayPattern hops
// to reach `Array`, descending the wrapper's init ArrayExpression at each depth
const wrapper = [[Array]];
const [[{ from }]] = wrapper;
from([1, 2, 3]);

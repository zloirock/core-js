import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Each element of a multi-element array pattern receives its own pure static.
// The shared declaration retains both bindings in source order.
const [{
  from
}, {
  of
}] = [{
  from: _Array$from
}, {
  of: _Array$of
}];
from([1]);
of(2, 3);
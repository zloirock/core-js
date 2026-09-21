import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A nested static before another static destructure retains both claims.
// Declaration rewriting must work in either sibling order.
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const of = _Array$of;
of;
from([1]);
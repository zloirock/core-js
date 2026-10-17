import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Each static in an array-wrapped object pattern receives its own pure method.
const [{
  from,
  of
}] = [{
  from: _Array$from,
  of: _Array$of
}];
from([1, 2]);
of(3, 4);
import _Array$from from "@core-js/pure/actual/array/from";
// An array-wrapped object pattern with a dead default receives the pure static.
// The known element decides the live receiver before the default is considered.
const [{
  from
} = {}] = [{
  from: _Array$from
}];
from([1, 2, 3]);
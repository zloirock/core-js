import _Array$from from "@core-js/pure/actual/array/from";
// A container reassigned after a nested destructure still supplies its earlier captured constructor.
// The static read at that earlier site receives the pure method.
let w = {
  Arr: Array
};
const {
  Arr: {
    from
  }
} = {
  Arr: {
    from: _Array$from
  }
};
from([1, 2, 3]);
w = {};
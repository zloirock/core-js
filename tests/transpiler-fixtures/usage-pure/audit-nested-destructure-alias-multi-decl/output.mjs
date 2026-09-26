import _Array$from from "@core-js/pure/actual/array/from";
// A nested static and a plain sibling retain their binding names and declaration order.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  x = 1;
from([1]);
console.log(x);
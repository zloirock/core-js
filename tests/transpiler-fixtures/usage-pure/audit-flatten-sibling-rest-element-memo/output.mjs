import _Array$from from "@core-js/pure/actual/array/from";
// A static declaration and a rest-bearing instance sibling keep their evaluation order.
// The instance slot remains native because its level copies object rest.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  {
    at,
    ...rest
  } = getArr();
from([1]);
console.log(at, rest);
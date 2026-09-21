import _Array$from from "@core-js/pure/actual/array/from";
const trigger = 1,
  [{
    Array: {
      from
    }
  }] = [(sideEffect(), {
    Array: {
      from: _Array$from
    }
  })];
from([1, 2, 3]);
trigger;
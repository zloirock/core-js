import _Array$from from "@core-js/pure/actual/array/from";
// An exported nested static keeps its source export name and receives the pure method.
export const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
from([1, 2]);
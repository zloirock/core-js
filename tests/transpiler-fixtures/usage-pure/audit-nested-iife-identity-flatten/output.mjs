import _Array$from from "@core-js/pure/actual/array/from";
// An identity IIFE preserves its call shape while supplying a mirrored static receiver.
const {
  Array: {
    from
  }
} = (g => g)({
  Array: {
    from: _Array$from
  }
});
from([1]);
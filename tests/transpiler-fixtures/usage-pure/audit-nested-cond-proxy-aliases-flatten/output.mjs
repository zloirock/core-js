import _Array$from from "@core-js/pure/actual/array/from";
// A pure selection whose arms name the same realm serves one pure static.
// No runtime branch is needed to choose the method.
let c = true;
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
from([1]);
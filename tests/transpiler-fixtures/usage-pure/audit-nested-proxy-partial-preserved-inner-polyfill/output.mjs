import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Both nested static bindings receive pure methods.
// Their imports are defined, so a default reading the original static remains dead.
const {
  Array: {
    from,
    of = Array.of
  }
} = {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
};
from([1, 2]);
of(3);
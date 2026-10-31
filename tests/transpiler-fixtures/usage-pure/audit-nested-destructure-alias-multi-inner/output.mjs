import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Multiple statics under one nested constructor each receive their pure method.
// The shared receiver rewrite preserves every binding.
const {
  Array: {
    from,
    of
  }
} = {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
};
from([1]);
of(1, 2);
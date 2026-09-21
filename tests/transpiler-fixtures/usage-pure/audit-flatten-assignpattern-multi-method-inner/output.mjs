import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A default around a nested static pattern retains both independent method claims.
// The pristine Array receiver makes the object default unreachable.
const {
  Array: {
    from,
    of
  } = {}
} = {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
};
from('hi');
of(1, 2);
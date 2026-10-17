import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// A nested static and an instance destructure share one declaration.
// Each claim keeps its own receiver and polyfill when the declaration is rewritten.
const at = _at(getArr());
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
at;
from([1]);
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// An effectful residual key reads the earlier extracted binding.
// Capture the initializer before binding it, then evaluate the key.
const holder = {
  get A() {
    note('init');
    return Array;
  }
};
const from = (holder.A, _Array$from),
  of = (note(typeof from), _Array$of);
use(of(7));
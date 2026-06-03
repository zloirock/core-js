import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// static-object receiver nested flatten: the receiver `wrapper` stays verbatim in the
// rebuilt init (no proxy-global root to substitute), so the residual init tail AND the
// residual `x` default `[2].flat()` are both kept verbatim. the flatten extracts
// `from = _Array$from` and the residual instance call must still be polyfilled in place
const wrapper = {
  ns: Array
};
const from = _Array$from;
const {
  x = _flatMaybeArray(_ref = [2]).call(_ref)
} = wrapper;
from([3]);
x;
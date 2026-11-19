import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The plain computed key runs once, including when the optional chain yields undefined.
function read({
  from
} = ((null == self ? void 0 : _globalThis.window)[note(), 'Array'], {
  from: _Array$from
})) {
  return from;
}
use(read);
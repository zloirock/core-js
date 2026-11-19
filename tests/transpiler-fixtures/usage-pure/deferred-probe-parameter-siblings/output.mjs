import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Each key of the default receiver uses its own pure static. Accepting the first
// key must leave the source receiver available to the remaining keys.
function read({
  of,
  from
} = ((null == _globalThis.window ? void 0 : _self).Array, {
  of: _Array$of,
  from: _Array$from
})) {
  return [of(3), from([4])];
}
read();
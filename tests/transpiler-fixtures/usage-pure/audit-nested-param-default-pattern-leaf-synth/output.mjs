import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a pattern-valued leaf (`of: { name }`) receives the polyfill VALUE in the mirrored default
// and destructures it natively - reading the polyfill's own properties is ordinary
// polyfill-wins behavior, same as any member read on a polyfilled static
function f({
  Array: {
    from,
    of: {
      name
    }
  }
} = {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
}) {
  return [from, name];
}
f();
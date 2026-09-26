import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// An effectful argument still supplies the static beside an opaque parameter default.
// The argument prefix and later argument run before extraction; the custom default stays intact.
export function outer(Custom, effects) {
  function read({
    of
  } = Custom, later) {
    return [of(1), later];
  }
  return [read((_pushMaybeArray(effects).call(effects, 'argument'), {
    of: _Array$of
  }), _pushMaybeArray(effects).call(effects, 'later')), read(undefined, 3)];
}
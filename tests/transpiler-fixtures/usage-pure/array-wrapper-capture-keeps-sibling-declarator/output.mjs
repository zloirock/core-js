import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An effectful array-wrapper leaf keeps its residual beside a trailing declarator.
// Both instance reads keep their source order within the shared declaration.
export function read(log) {
  const [_ref] = [[3]],
    at = null == _ref ? _ref[""] : (_pushMaybeArray(log).call(log, 'key'), _atMaybeArray(_ref)),
    {
      other
    } = _ref,
    includes = _includesMaybeArray([1, 2]);
  return [at, other, includes];
}
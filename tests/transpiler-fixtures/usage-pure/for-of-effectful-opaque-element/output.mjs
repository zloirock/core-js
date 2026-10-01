import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// An effectful constructor element retains its call beside an opaque prototype default.
// The instance leaf keeps generic dispatch while the static retains its substitution.
export function read(unknown) {
  const log = [];
  function make() {
    _pushMaybeArray(log).call(log, 'make');
    return Array;
  }
  for (const _ref2 of [make()]) {
    const from = _Array$fromAsync;
    const {
        prototype: _ref = unknown
      } = _ref2,
      at = _at(_ref),
      {
        length
      } = _ref;
    use(from, at, length);
  }
  return log;
}
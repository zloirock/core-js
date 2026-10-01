import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _at from "@core-js/pure/actual/instance/at";
// A constructor candidate beside an opaque value keeps the nested capture and static guard.
// The unknown prototype still needs generic dispatch after the claims move.
export function read(flag, unknown) {
  for (const R of [flag ? Array : unknown]) {
    const _ref2 = R,
      {
        prototype: _ref
      } = _ref2,
      at = _at(_ref),
      {
        length
      } = _ref,
      from = _ref2 === Array ? _Array$fromAsync : _ref2.fromAsync;
    use(at, length, from);
  }
}
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _at from "@core-js/pure/actual/instance/at";
// A constructor candidate beside an opaque value keeps the nested capture and static guard.
// The unknown prototype still needs generic dispatch after the claims move.
export function read(flag, unknown) {
  for (const R of [flag ? Array : unknown]) {
    const {
        prototype: _ref
      } = R,
      at = _at(_ref),
      {
        length
      } = _ref,
      from = R === Array ? _Array$fromAsync : R.fromAsync;
    use(at, length, from);
  }
}
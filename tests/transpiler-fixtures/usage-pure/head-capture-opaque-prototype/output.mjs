import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _at from "@core-js/pure/actual/instance/at";
// A constructor candidate beside an opaque value keeps the nested capture and static guard.
// The unknown prototype still needs generic dispatch after the claims move.
export function read(flag, unknown) {
  for (const R of [flag ? Array : unknown]) {
    const _ref = R;
    const _ref2 = _ref.prototype;
    const at = _at(_ref2);
    const {
      length
    } = _ref2;
    const from = _ref === Array ? _Array$fromAsync : _ref.fromAsync;
    use(at, length, from);
  }
}
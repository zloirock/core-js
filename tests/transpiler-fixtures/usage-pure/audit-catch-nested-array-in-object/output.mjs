import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// The nested array pattern reads the already captured catch receiver.
// Its native read rejects null before the later instance dispatch, so that dispatch
// needs neither another receiver capture nor another null probe.
try {
  throw {
    inner: [{}],
    flat: "x"
  };
} catch (_ref) {
  let {
      inner: [first]
    } = _ref,
    flat = _flatMaybeArray(_ref);
  _at(first).call(first, 0);
  _at(flat).call(flat, 0);
}
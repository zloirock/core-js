import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
const _ref = [1, [2], 3];
const at = _atMaybeArray(_ref);
const flat = _flatMaybeArray(_ref);
// TWO instance methods (`at`, `flat`) destructured off the SAME nested constant-literal receiver. each leaf
// is body-extracted, but the receiver is memoized into a SINGLE shared `_ref` (keyed by the receiver node)
// rather than re-emitted once per leaf - so the literal appears once, not three times. the declaration binds
// two names, so the residual is kept (elimination needs a sole binding); both sentinels survive in it
const {
  b: {
    at: _unused,
    flat: _unused2
  }
} = {
  b: _ref
};
at(0);
flat();
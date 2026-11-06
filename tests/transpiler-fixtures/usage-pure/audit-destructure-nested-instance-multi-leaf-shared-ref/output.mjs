import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// TWO instance methods (`at`, `flat`) destructured off the SAME nested constant-literal receiver. each leaf
// is body-extracted, but the receiver is memoized into a SINGLE shared `_ref` (keyed by the receiver node)
// rather than re-emitted once per leaf - so the literal appears once. the residual is left binding only the
// two sentinels and reading what the extractions already read, so it is eliminated on both emitters
const {
    b: _ref
  } = {
    b: [1, [2], 3]
  },
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref);
at(0);
flat();
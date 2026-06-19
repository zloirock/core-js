import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
const a = _atMaybeArray([_Promise]);
const b = _includesMaybeArray([_Promise]);
// TWO instance methods destructured off the SAME nested NON-constant receiver (it nests a polyfillable
// global, so it is NOT memoized into a `_ref` like a pure constant literal). each leaf gets its own copy
// of the receiver with the global substituted, and the surviving residual keeps it polyfilled too - the
// composed copy text is computed ONCE per receiver and reused across leaves (not re-drained to raw on the
// second leaf). distinct multi-type instance methods per leaf so each copy is attributable.
const {
  y: {
    at: _unused,
    includes: _unused2
  },
  k
} = {
  y: [_Promise],
  k: 1
};
export const r = [a, b, k];
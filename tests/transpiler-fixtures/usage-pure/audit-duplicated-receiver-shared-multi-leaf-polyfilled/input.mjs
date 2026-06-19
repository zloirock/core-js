// TWO instance methods destructured off the SAME nested NON-constant receiver (it nests a polyfillable
// global, so it is NOT memoized into a `_ref` like a pure constant literal). each leaf gets its own copy
// of the receiver with the global substituted, and the surviving residual keeps it polyfilled too - the
// composed copy text is computed ONCE per receiver and reused across leaves (not re-drained to raw on the
// second leaf). distinct multi-type instance methods per leaf so each copy is attributable.
const { y: { at: a, includes: b }, k } = { y: [Promise], k: 1 };
export const r = [a, b, k];

import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// class-EVAL-TIME positions inside a literal receiver make it single-read-only: a static field
// initializer reading a member would re-run per emitted copy, so the multi-binding form bails
// to the native destructure
const {
  y: {
    at: a
  },
  q
} = {
  y: [class K {
    static p = holder.p;
  }],
  q: 1
};
// an INSTANCE field initializer runs per construction (user code constructs whichever copy it
// reads), so the literal stays freely copyable
const b = _flatMaybeArray([class L {
  p = holder.p;
}]);
export const r = [a, b, q];
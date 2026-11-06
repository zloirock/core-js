import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A class-evaluation-time value makes the literal receiver single-read-only. Capture the whole
// object once, select the nested instance method from that capture, then read the outer sibling.
const _ref = {
  y: [class K {
    static p = holder.p;
  }],
  q: 1
};
const a = _atMaybeArray(_ref.y);
const {
  q
} = _ref; // an INSTANCE field initializer runs per construction (user code constructs whichever copy it
// reads), so the literal stays freely copyable
const b = _flatMaybeArray([class L {
  p = holder.p;
}]);
export const r = [a, b, q];
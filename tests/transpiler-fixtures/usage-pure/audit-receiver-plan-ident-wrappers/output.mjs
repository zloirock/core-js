import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A computed-key effect runs after the destructuring receiver is evaluated and
// checked, even when wrappers hide a bare identifier. Quiet source names can be
// reused; a receiver prefix still runs once before the ordered extraction.
var {} = arr as any,
  a = (k1(), _at(arr)),
  {
    other
  } = arr;
var {} = arr2,
  f = (k2(), _flatMaybeArray(arr2)),
  {
    more
  } = arr2;
// A prefix on the receiver runs once before the same ordered extraction.
var {} = (se1(), arr3) as any,
  inc = (k3(), _includes(arr3)),
  {
    rest
  } = arr3;
export const r = [a, f, inc, other, more, rest];
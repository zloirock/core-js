import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an effectful computed key over an instance claim on a literal receiver: the literal is evaluated once,
// ahead of the key, and the dispatch reads that memo - beside a sibling declarator on either side, in a
// for or if head, and under an export, which exposes only the source bindings
let k = 0;
var t1 = 0,
  a1 = (k++, _atMaybeArray([1]));
var a2 = (k++, _atMaybeArray([1])),
  t2 = 0;
var t3 = 0,
  _ref = [1],
  a3 = (k++, _atMaybeArray(_ref)),
  {
    other3
  } = _ref;
for (var t4 = 0, a4 = (k++, _atMaybeArray([1])); false;) break;
if (k) var t5 = 0,
  a5 = (k++, _atMaybeArray([1]));
export const t6 = 0,
  a6 = (k++, _atMaybeArray([1]));
export default [a1, a2, a3, other3, a4, a5, t1, t2, t3, t4, t5, k];
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// SE-key TDZ pairs group with their predecessor through the statement split: two pairs
// stay two statements, a plain post-sibling splits away from the pair
const {
    [(e1(), 'at')]: _unused
  } = arr,
  {
    [(e2(), 'flat')]: _unused2
  } = arr2,
  a = _at(arr),
  f = _flatMaybeArray(arr2);
const {
    [(e3(), 'includes')]: _unused3
  } = arr3,
  plain = 5,
  i = _includes(arr3);
console.log(a, f, i, plain);
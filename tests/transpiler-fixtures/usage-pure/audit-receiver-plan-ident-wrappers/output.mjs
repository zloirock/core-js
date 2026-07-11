import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var a = _at(arr);
// an init that peels (TS cast / parens) to a bare Identifier is freely re-referenceable:
// both emitters REUSE the identifier instead of memoizing the wrapped init (the unified
// receiver plan decides once for both; babel used to pre-memo `_ref = arr as any` here)
var {
  [(k1(), 'at')]: _unused,
  other
} = arr as any;
var f = _flatMaybeArray(arr2);
var {
  [(k2(), 'flat')]: _unused2,
  more
} = arr2;
// an SE-crossed peel is NOT a bare reuse: the whole-init memo keeps the prefix in order
var _ref = (se1(), arr3) as any,
  {
    [(k3(), 'includes')]: _unused3,
    rest
  } = _ref,
  inc = _includes(_ref);
export const r = [a, f, inc, other, more, rest];
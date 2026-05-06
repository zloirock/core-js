import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// computed key with non-statically-resolvable expression: `[fn()]: Array`. resolveKey
// can't fold a CallExpression to a string, returns null. walker skips this prop and falls
// through to subsequent ones (none match), returns null. destructure stays unflattened
// (negative-by-design lock - unknowable runtime key). companion to audit-static-walk-
// computed-key-skip which DOES resolve via const-binding folding
declare const fn: () => string;
const wrapper = {
  [fn()]: Array
};
const {
  a: {
    from
  }
} = wrapper;
from;
_atMaybeArray(_ref = [1]).call(_ref, 0);
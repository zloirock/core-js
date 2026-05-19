import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// nested destructure parameter: `function f({outer: {inner}})` produces a key
// path `['outer', 'inner']` that the call-arg's literal must be walked
// step-by-step. `findPatternKeyPath` recurses through both ObjectPattern and
// ArrayPattern wrappers; `resolveObjectMemberPath` follows the path through
// nested ObjectExpression literals. without recursion the inner binding would
// match no pattern slot and the resolver would fall back to generic dispatch
function f({
  outer: {
    inner
  }
}) {
  return inner;
}
_atMaybeArray(_ref = f({
  outer: {
    inner: [1, 2, 3]
  }
})).call(_ref, 0);
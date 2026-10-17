// nested destructure param `function f({outer: {inner}})` yields key path
// `['outer', 'inner']` walked step-by-step against the call-arg literal: recursion
// descends both ObjectPattern and ArrayPattern wrappers and follows the path through
// nested ObjectExpression literals. without it the inner binding matches no slot and
// the resolver falls back to generic dispatch.
function f({ outer: { inner } }) {
  return inner;
}
f({ outer: { inner: [1, 2, 3] } }).at(0);

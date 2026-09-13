import _at from "@core-js/pure/actual/instance/at";
// Each computed key runs after coercion of its own receiver, and each hop getter runs once.
// Capturing the outer pattern leaves the innermost method dispatch in that same order.
export function opaque(make, outer, leaf) {
  const _ref2 = make(),
    {
      [(outer(), 'w')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    _ref3 = _ref,
    method = null == _ref3 ? _ref3[""] : (leaf(), _at(_ref3));
  return method;
}
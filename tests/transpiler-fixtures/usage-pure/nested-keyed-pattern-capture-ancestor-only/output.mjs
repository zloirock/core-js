import _at from "@core-js/pure/actual/instance/at";
// An effectful outer key still captures the inner receiver when the leaf key is plain.
// The inner pattern keeps its nullish coercion before the method dispatch.
export function ancestor(make, outer) {
  const _ref2 = make(),
    {
      [(outer(), 'w')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    method = _at(_ref);
  return method;
}
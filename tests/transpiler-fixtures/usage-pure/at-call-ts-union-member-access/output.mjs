import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// regression: accessing a member across a union type used to fail because
// findTypeMember only iterated getTypeMembers output, which bails on TSUnionType.
// after the fix we recurse into each branch and fold results — when any branch
// has the property, we use its annotation (lenient, but the right answer for
// polyfill hint inference). expect `_atMaybeArray`.
type X = {
  kind: 'a';
  val: string[];
} | {
  kind: 'b';
};
function f(x: X) {
  var _ref;
  if (x.kind === 'a') return _atMaybeArray(_ref = x.val).call(_ref, 0);
}
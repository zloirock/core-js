import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// @flow
// resolveMemberInTypeMembers walked m.typeAnnotation ?? m.returnType but Flow's
// ObjectTypeProperty stores the type in `m.value`. without the value fallback, typed
// chained-property narrowing through nested ObjectTypeAnnotation fails: the `.x` hop
// goes through `resolveMemberAnnotation` (NOT `findTypeMember`), which uses the
// member-by-name helper that lacked the Flow shape. at-call on the final segment then
// emits the generic polyfill instead of the Array-shape narrow
type Container = {
  x: {
    items: Array<number>
  }
};
export function probe(c: Container) {
  var _ref;
  return _atMaybeArray(_ref = c.x.items).call(_ref, -1);
}
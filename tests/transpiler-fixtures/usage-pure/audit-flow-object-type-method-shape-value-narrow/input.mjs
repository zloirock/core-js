// @flow
// Flow ObjectTypeProperty in METHOD shape: `method(): T` parses as ObjectTypeProperty whose
// `.value` is a FunctionTypeAnnotation (Flow doesn't distinguish method-vs-property at the
// AST level - the discriminator is value.type). without `m.value` in the fallback chain,
// resolveMemberInTypeMembers can't extract the FunctionTypeAnnotation for chained-property
// hops, and the at-call on the method's return type falls back to generic
type API = {
  list: { getItems(): Array<number> },
};
function probe(api: API) {
  return api.list.getItems().at(-1);
}
probe({ list: { getItems: () => [1, 2, 3] } });

// @flow
// Flow ObjectTypeProperty in METHOD shape: `method(): T` parses as ObjectTypeProperty
// whose `.value` is a FunctionTypeAnnotation (Flow uses value.type, not a separate node,
// to distinguish method vs property). without the `m.value` fallback, chained-property
// hops can't extract the return type and the at-call falls back to generic
type API = {
  list: { getItems(): Array<number> },
};
function probe(api: API) {
  return api.list.getItems().at(-1);
}
probe({ list: { getItems: () => [1, 2, 3] } });

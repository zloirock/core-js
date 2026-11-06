// `infer U extends V` where `V` is bound in the outer generic context. the infer-pattern
// constraint must resolve with the outer type-param map carried through, else `V` looks
// unresolved at the inference site. with the map, `V` resolves to its outer binding and the
// downstream narrow uses the bound concrete shape instead of an opaque type.
type FirstOrV<T, V> = T extends Array<infer U extends V> ? U : V;
function probe<S>(arr: S[], fallback: S): FirstOrV<S[], S> {
  return arr[0] ?? fallback;
}
declare const items: string[];
probe(items, "fallback").at(0);

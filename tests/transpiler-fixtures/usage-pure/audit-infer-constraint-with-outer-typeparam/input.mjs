// `infer U extends V` where `V` is bound in the outer generic context. previously
// `resolveInferElementPattern`'s constraint fallback called bare `resolveTypeAnnotation`
// (no typeParamMap), so `V` looked unresolved at the inference site. with the fix,
// `substituteTypeParams` carries the outer map through and `V` resolves to its outer
// binding - downstream narrow uses the bound concrete shape instead of opaque
type FirstOrV<T, V> = T extends Array<infer U extends V> ? U : V;
function probe<S>(arr: S[], fallback: S): FirstOrV<S[], S> {
  return arr[0] ?? fallback;
}
declare const items: string[];
probe(items, "fallback").at(0);

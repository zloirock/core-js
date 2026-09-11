// @flow
// Flow ObjectTypeProperty stores its type in `m.value` (not typeAnnotation/returnType).
// without that fallback, chained-property narrowing through nested ObjectTypeAnnotation
// fails: the `.x` hop's member-by-name lookup misses the Flow shape, so at-call on the
// final segment emits the generic polyfill instead of the Array-shape narrow
type Container = {
  x: { items: Array<number> },
};
export function probe(c: Container) {
  return c.x.items.at(-1);
}

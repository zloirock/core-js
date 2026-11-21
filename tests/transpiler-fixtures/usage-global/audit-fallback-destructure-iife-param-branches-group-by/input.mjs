export function select(flag) {
  return (({ groupBy } = flag ? Map : Object) => groupBy([1], x => x))();
}

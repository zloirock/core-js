export function fromDefault(flag) {
  const { V: { C: { groupBy } } = flag ? { C: Map } : { C: Object } } = {};
  return groupBy([1], x => x);
}

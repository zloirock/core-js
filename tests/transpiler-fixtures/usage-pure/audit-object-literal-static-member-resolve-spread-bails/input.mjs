// A trailing spread may replace the slot; preserve the replacement's own property.
export function spreadBails(extra) {
  const ns = { Q: Map, ...extra };
  const { Q: { groupBy } } = ns;
  return groupBy([], x => x);
}

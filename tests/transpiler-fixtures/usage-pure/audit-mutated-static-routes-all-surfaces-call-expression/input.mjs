// A destructured static observes the write to the same constructor slot.
Map.groupBy = c1;
const { groupBy } = Map;
export const r2 = groupBy(items, fn);

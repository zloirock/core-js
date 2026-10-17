// Deleting a static through a TS wrapper keeps the following call on the mutated constructor.
delete (Map.groupBy as any);
export const r1 = Map.groupBy(x, f);

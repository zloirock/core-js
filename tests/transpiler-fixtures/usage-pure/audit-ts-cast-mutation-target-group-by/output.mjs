import _Map from "@core-js/pure/actual/map";
// Deleting a static through a TS wrapper keeps the following call on the mutated constructor.
// @ts-expect-error a delete tsc refuses is the shape under test
delete (_Map.groupBy as any);
export const r1 = _Map.groupBy(x, f);
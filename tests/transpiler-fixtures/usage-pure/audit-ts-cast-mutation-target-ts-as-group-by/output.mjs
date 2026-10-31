import _Map from "@core-js/pure/actual/map";
// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
// @ts-expect-error a delete tsc refuses is the shape under test
delete (_Map.groupBy as any);
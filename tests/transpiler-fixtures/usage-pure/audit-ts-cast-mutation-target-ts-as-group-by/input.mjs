// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
delete (Map.groupBy as any);

// `(a?.b as string[]).at(0)` - optional-chain root detection treats the TS `as` cast as
// a transparent wrapper and still deopts the `?.` chain; otherwise the chain detection
// would trip on the `(a?.b as X)` syntax
declare const a: { b: string[] | null } | null;
(a?.b as string[]).at(0);

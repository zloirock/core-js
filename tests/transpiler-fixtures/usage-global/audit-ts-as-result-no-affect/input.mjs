// `(Map.groupBy(...) as any)` cast on a polyfilled call result: the cast does not
// affect rewriting - the inner call is still polyfilled.
arr.at(-1) as number;
arr.includes(1) satisfies boolean;
Array.from!([1]) as any[];

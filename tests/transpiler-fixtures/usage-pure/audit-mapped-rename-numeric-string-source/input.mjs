// `K extends number` predicate against literal-union of numeric-quoted strings
// ('0' | '1') - both have numeric shape, both pass through to true branch
type NumericFilter<K extends string> = { [P in K as P extends number ? P : never]: number[] };
declare const r: NumericFilter<'0' | '1' | 'foo'>;
r['0'].at(0);
r['1'].includes(1);

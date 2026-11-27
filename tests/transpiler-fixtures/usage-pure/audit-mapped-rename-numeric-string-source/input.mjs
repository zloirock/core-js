// Quoted '0' is a string key. Only the numeric key survives the mapped filter.
type NumericFilter<K extends PropertyKey> = { [P in K as P extends number ? P : never]: number[] };
declare const r: NumericFilter<'0' | 1 | 'foo'> & { '0': string };
r['0'].at(0);
r[1].includes(1);

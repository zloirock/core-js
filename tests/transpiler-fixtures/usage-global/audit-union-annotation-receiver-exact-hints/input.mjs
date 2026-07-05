// a cross-family union receiver has no single-Type representation, but its hint SET is
// exact: usage-global injects only the union's variants (es.array.includes +
// es.string.includes) - NOT every variant of the method (the Iterator group is provably
// excluded by the union). a nullable arm contributes nothing (nullish receivers throw)
declare const r: number[] | string;
r.includes('x');
declare const n: string[] | string | null;
n.at(0);

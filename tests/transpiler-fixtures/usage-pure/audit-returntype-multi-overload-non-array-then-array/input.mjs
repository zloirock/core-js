// Three ambient overload heads where only the LAST returns an array. ReturnType<typeof fn>
// resolves against the last head (TS rule), so r is number[] and `.at(0)` emits the Array
// variant; resolving against an earlier head would give string and no Array narrow.
declare function fn(x: 'a'): string;
declare function fn(x: 'b'): boolean;
declare function fn(x: 'c'): number[];
const r: ReturnType<typeof fn> = [1, 2];
r.at(0);

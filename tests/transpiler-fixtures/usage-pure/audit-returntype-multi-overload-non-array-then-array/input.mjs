// pickLastAmbientOverload: 3 overload heads, only the LAST returns an array.
// TS canonical resolution picks last - if the helper instead picked first/middle,
// receiver type would be `string` (no array polyfill needed) and `.at` would
// either misroute or stay inert. With correct last-pick, `_atMaybeArray` should
// fire on `r` because the last overload returns number[].
declare function fn(x: 'a'): string;
declare function fn(x: 'b'): boolean;
declare function fn(x: 'c'): number[];
const r: ReturnType<typeof fn> = [1, 2];
r.at(0);

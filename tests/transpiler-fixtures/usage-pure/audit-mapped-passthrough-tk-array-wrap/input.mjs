// edge for the identity-rename branch: body `T[K][]` substitutes K -> sourceKey per
// member, then wraps the original member type in an array. `Wrap<{ x: number, y: string }>`
// resolves to `{ x: number[], y: string[] }`. `at` polyfill on each member dispatches
// to the array flavour because the receiver type is array. cross-key dispatch is visible:
// `r.x.at(0)` and `r.y.includes('a')` both narrow correctly through the K-substitution
type Wrap<T> = { [K in keyof T]: T[K][] };
declare const r: Wrap<{ x: number; y: string }>;
r.x.at(0);
r.y.includes('a');

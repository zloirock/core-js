// `Extract<T, string[]>` over a type-param `T` bound at call site to `string[]`.
// Substitution must thread `T` through Extract before classification picks an array-aware polyfill.
type Extracted<T> = Extract<T, string[]>;
declare function probe<T>(arg: T): Extracted<T>;
const r = probe<string[]>(null!);
r.at(0);

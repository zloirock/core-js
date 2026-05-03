// regression lock for the no-placeholder guard: a TSTemplateLiteralType with a real
// `${string}` placeholder must still match keys that have the head as a prefix. without
// this lock the no-placeholder fix could have over-restricted the matcher and broken the
// placeholder-bearing template case. `at` and `includes` are defined on both Array and
// String, so per-key type-routing is visible: `r.fooArr.at(0)` resolves to
// `_atMaybeArray` (number[]), `r.fooStr.includes('a')` resolves to `_includesMaybeString`
// (string). bar (boolean, no `at`/`includes`) is filtered out of the rename and never
// reaches the polyfill emit
type Filter<T> = { [K in keyof T as K extends `foo${ string }` ? K : never]: T[K] };
declare const r: Filter<{ fooArr: number[]; fooStr: string; bar: boolean }>;
r.fooArr.at(0);
r.fooStr.includes('a');

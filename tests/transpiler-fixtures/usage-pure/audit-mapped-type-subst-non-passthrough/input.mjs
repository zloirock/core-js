// non-trivial mapped body with `| null` union: `Box<T> = { [K in keyof T]: T[K] | null }`.
// substitution into the mapped body works (T propagates through index access), but the
// resulting union `string[] | null` doesn't narrow through `?.at(0)` to drop the null arm
// for instance-method dispatch - precision limit similar to plain `string[] | undefined`
// receivers. fixture documents the actual emit (generic instance polyfill) so the gap is
// visible as test coverage rather than silently producing wrong narrowing
type Box<T> = { [K in keyof T]: T[K] | null };
declare const b: Box<{ a: string[] }>;
b.a?.at(0);

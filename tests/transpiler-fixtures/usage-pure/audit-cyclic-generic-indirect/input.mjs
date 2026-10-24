// indirect self-wrap through an intermediary: `A<T>` substitutes into `B<T[]>`
// which substitutes back into `A<T[][]>`. Without cycle tracking, both A and B
// re-enter user-defined-type resolution fresh each time; with cycle tracking, the
// second visit of either alias short-circuits to null. Receiver resolves to null,
// so `.at` falls back to the generic instance polyfill
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type A<T> = B<T[]>;
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type B<T> = A<T[]>;
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
declare const a: A<string>;
a.at(0);

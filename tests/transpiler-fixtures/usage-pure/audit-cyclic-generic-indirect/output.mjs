import _at from "@core-js/pure/actual/instance/at";
// indirect self-wrap through an intermediary: `A<T>` substitutes into `B<T[]>`
// which substitutes back into `A<T[][]>`. Without cycle tracking, both A and B
// re-enter user-defined-type resolution fresh each time; with cycle tracking, the
// second visit of either alias short-circuits to null. Receiver resolves to null,
// so `.at` falls back to the generic instance polyfill
type A<T> = B<T[]>;
type B<T> = A<T[]>;
declare const a: A<string>;
_at(a).call(a, 0);
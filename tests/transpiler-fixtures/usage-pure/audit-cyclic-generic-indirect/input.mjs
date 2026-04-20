// indirect self-wrap through an intermediary: `A<T>` substitutes into `B<T[]>`
// which substitutes back into `A<T[][]>`. without `seen` threading, both A and B
// re-enter resolveUserDefinedType fresh each time; with seen, the second visit of
// either alias short-circuits to null. receiver resolves to null -> generic `_at`
type A<T> = B<T[]>;
type B<T> = A<T[]>;
declare const a: A<string>;
a.at(0);

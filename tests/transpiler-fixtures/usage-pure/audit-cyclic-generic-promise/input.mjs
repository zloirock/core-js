// self-wrap through a known container (`Promise`): outer `Promise<T>` resolvable, but
// inner `Nested<Promise<T>>` re-enters Nested cyclically. cycle detection bails the
// receiver type to null. without a known type, `n.at(0)` falls through to the generic
// instance-method polyfill (works for any iterable receiver shape)
type Nested<T> = Nested<Promise<T>>;
declare const n: Nested<string>;
n.at(0);

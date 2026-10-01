// Interface extends `Base<T[]>` and inherits `inner: T[]` after deep substitution through the array wrapper.
// Verifies typearg substitution composes across extends rather than dropping at the parent boundary.
interface Base<X> {
  inner: X;
}
interface Wrap<T> extends Base<T[]> {
  outer: T;
}
declare const w: Wrap<string>;
w.inner.at(0);

// `interface A<T> extends B<T[]>; interface B<T> { b: T }` - the inner B<T[]> binds B's
// type-param T to A's `T[]` slot. the recursive member walk already substitutes B's body in
// A's coordinate space (`[{b: T[]}]`); RE-applying B's subst on top, with A and B sharing the
// name 'T', double-substitutes the inner T to `T[][]` -> `string[][]` instead of `string[]`.
// observable: after the fix `a.b[0]` is `string`, so `.at()` ships the string polyfill not the array one
interface A<T> extends B<T[]> {}
interface B<T> {
  b: T;
}
declare const a: A<string>;
a.b[0].at(0);

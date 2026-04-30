// chain of generic classes with extends-substitution: `A<T> extends B<T>`,
// `B<U> extends C<U[]>`, `C<V>.firstC(): V[]`. for `const x: A<string>`, type parameters
// must propagate through the whole chain so `firstC()` resolves to `string[][]` and both
// `.at(0)` and `.flat()` pick the array-specific polyfills
class C<V> {
  firstC(): V[] {
    return [];
  }
}
class B<U> extends C<U[]> {}
class A<T> extends B<T> {}
declare const x: A<string>;
x.firstC().at(0).flat();

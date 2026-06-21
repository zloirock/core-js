// class+interface declaration merging where the interface uses a renamed type-param
// (`class C<T>` + `interface C<U>`). receiver `C<string[]>` keys its subst by the class's
// `T`; without remapping, the interface body's bare `U` stays unsubstituted (opaque) and
// `c.inner.at(0)` falls to generic dispatch. the subst must be rebuilt using the interface's
// own type-param names at matching positions so `U -> string[]` kicks in and dispatch reaches Array
class C<T> {
  base(): T { return null!; }
}
interface C<U> {
  inner: U;
}
declare const c: C<string[]>;
c.inner.at(0);

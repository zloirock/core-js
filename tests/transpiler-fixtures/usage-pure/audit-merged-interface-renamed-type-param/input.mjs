// class+interface declaration merging where the interface uses a renamed type-param
// (`class C<T>` + `interface C<U>`). receiver `C<string[]>` produces classSubst keyed by
// the class's `T`; without remapping, the interface body's bare `U` reference stays
// unsubstituted (becomes opaque type-param) and `c.inner.at(0)` falls to generic `_at`.
// fix rebuilds subst using interface's own type-param names at matching positions, so
// `U -> string[]` substitution kicks in and dispatch reaches Array
class C<T> {
  base(): T { return null!; }
}
interface C<U> {
  inner: U;
}
declare const c: C<string[]>;
c.inner.at(0);

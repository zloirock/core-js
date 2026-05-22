// merged interface with renamed type-parameter whose sibling decl extends a
// generic parent passing the renamed parameter through. resolution must
// substitute the renamed parameter before recursing into the parent so the
// inherited property's element type reaches the call site.
interface Base<X> { read: X }
interface Foo<T> { a: T }
interface Foo<U> extends Base<U> {}
declare const f: Foo<string[]>;
f.read.at(0);

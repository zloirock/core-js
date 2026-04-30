// class+interface merging with renamed type-param, where the interface extends another
// generic interface threading the renamed param: `class C<T>` + `interface C<U> extends
// Base<U>`. the iface-subst (`U -> string[]`) must be applied to `Base<U>` BEFORE
// descending into Base's members, otherwise Base's parentSubst gets a raw `U` reference
// instead of the receiver's substituted type
interface Base<X> {
  read: X;
}
class Container<T> {
  ping(): T { return null!; }
}
interface Container<U> extends Base<U> {}
declare const c: Container<string[]>;
c.read.at(0);

// class + interface declaration merge where the interface sibling uses a renamed type-param.
// the class hop binds the receiver's type-args against the class type-param name; the interface
// hop must bind its OWN against the renamed iface type-param. without per-source binding the
// iface property carries a raw renamed param and the chained call bails to the generic polyfill.
// distinct methods (at vs includes) cover both hops.
declare class C<T> { a: T }
interface C<U> { b: U }
declare const c: C<string[]>;
c.a.at(0);
c.b.includes("h");

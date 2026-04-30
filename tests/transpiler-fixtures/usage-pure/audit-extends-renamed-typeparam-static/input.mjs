// Static inheritance with renamed type param across class chain.
// `class B<U> extends A<U>` should propagate U through buildParentClassSubst.
declare class A<T> {
  static head<X>(): X[];
}
declare class B<U> extends A<U> {}
const r = B.head<string>();
r.at(0);

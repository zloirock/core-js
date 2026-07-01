import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Static inheritance with renamed type param across class chain.
// `class B<U> extends A<U>` should propagate U through the parent-class substitution.
declare class A<T> {
  static head<X>(): X[];
}
declare class B<U> extends A<U> {}
const r = B.head<string>();
_atMaybeArray(r).call(r, 0);
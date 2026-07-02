// class extends cycle `A extends B`, `B extends A`: cycle detection bails the receiver
// type to null instead of `Object`. with no known type the `.at(0)` call falls through
// to the generic instance-method polyfill (still emitted, not suppressed)
class A extends B { foo() { return this.at(0); } }
class B extends A {}
declare const a: A;
a.at(0);

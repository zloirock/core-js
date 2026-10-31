// a member's COMPUTED KEY evaluates at class-definition time bound to the OUTER `this`, not an
// instance of the enclosing class. anchoring `this` (inside the key) to the class would narrow
// `this.foo()` to the class method's array return and emit the array-specific `.at` - a cross-type
// narrow. the key's `this` is outer / unknown, so `.at` stays the generic instance helper
class C {
  foo() {
    return [1, 2, 3];
  }
  [this.foo().at(0)]() {}
}
new C();

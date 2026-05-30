import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a member's COMPUTED KEY evaluates at class-definition time bound to the OUTER `this`, not an
// instance of the enclosing class. anchoring `this` (inside the key) to the class would narrow
// `this.foo()` to the class method's array return and emit the array-specific `.at` - a cross-type
// narrow. the key's `this` is outer / unknown, so `.at` stays the generic instance helper
class C {
  foo() {
    return [1, 2, 3];
  }
  [_at(_ref = this.foo()).call(_ref, 0)]() {}
}
new C();
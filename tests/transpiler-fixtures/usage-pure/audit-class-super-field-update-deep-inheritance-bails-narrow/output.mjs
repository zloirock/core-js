import _at from "@core-js/pure/actual/instance/at";
// Multi-level inheritance with UpdateExpression on super.field: A -> B -> C. C writes
// `super.items` via update operator (`++`); UpdateExpression handler must accept Super
// receiver alongside ThisExpression. with the fix, the update fires `internalThisScan`
// on B's methods AND C's methods, both surface as base-A field writes when descendant
// chain folds. without acceptance, deeply-inherited super-mutations silently drop and
// A.first()'s `this.items.at(0)` narrows incorrectly to array-only
class A {
  items = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class B extends A {}
class C extends B {
  bump() {
    super.items++;
  }
}
new C().bump();
new A().first();
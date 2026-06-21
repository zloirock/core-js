// multi-level inheritance with an UpdateExpression on super.field: A -> B -> C, where C
// does `super.items++`. the UpdateExpression handler must accept a Super receiver alongside
// ThisExpression so the write surfaces as a base-A field write when the chain folds. without
// it, deeply-inherited super-mutations drop and A.first()'s `this.items.at(0)` narrows array-only
class A {
  items = [1, 2, 3];
  first() { return this.items.at(0); }
}
class B extends A {}
class C extends B {
  bump() { super.items++; }
}
new C().bump();
new A().first();

// public field with a concrete Array init and no escaping write: the class is unexported and no
// instance is built in this module, so init-only flow folds the field to Array and the call
// narrows to the array-specific helper. an external write that reaches the field would widen it
// back to generic - that case is covered by the public-external-write-widens fixture
class C {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}

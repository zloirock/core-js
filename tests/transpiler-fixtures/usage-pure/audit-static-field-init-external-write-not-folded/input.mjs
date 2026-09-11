// negative companion to the instance field-init write fold: a STATIC field initializer runs eagerly
// at class-definition time, NOT at construction, so it is not a deferred context. an external write
// to a field inside a static initializer that sits past the temporal bound is a genuine future write
// and stays DROPPED, so the narrow holds and the chained `.at` keeps the array helper (widening the
// deferred-context gate must not pull static initializers in)
class A {
  items = [1, 2];
  m() {
    return this.items.at(0);
  }
}
class B {
  static bad = (new A().items = "str");
}
new B();

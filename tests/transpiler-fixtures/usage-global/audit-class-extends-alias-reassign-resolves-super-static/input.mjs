// `class C extends A` with `super.from(...)` where the superclass alias A is reassigned AFTER the
// class declaration - the class still extends Array, so super.from is Array.from and usage-global
// must inject es.array.from. the super-class-name resolver is now method-aware; usage-pure bails.
let A = Array;
class C extends A {
  static make() {
    return super.from([1, 2, 3]);
  }
}
A = Object;

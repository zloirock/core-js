// `extends A` captures Array as the superclass at class definition; reassigning the alias A inside a
// static method BEFORE the super call does not change the bound superclass, so super.from is
// Array.from and usage-global must inject es.array.from.
let A = Array;
class C extends A {
  static make() {
    A = Object;
    return super.from([1, 2, 3]);
  }
}

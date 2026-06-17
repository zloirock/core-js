// a private static field with ONLY its array initializer and NO widening write stays narrowed to
// Array, so the array-specific at variant is correct. the in-class-body write fold must not
// spuriously widen a private field that is never reassigned
class C {
  static #n = [1, 2, 3];
  static first() { return C.#n.at(0); }
}

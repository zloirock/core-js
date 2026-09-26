// multiple computed-key methods in the same class: each method's body-side walk must
// resolve to the class context independently. cache-poisoning fix means the first method's
// key-side walk doesn't corrupt the cache for the second method's body walk
class C {
  static A = "a";
  static B = "b";
  items = [1, 2, 3];
  [C.A]() { return this.items.at(0); }
  [C.B]() { return this.items.at(-1); }
}
new C()["a"]();
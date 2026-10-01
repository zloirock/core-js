// computed-key static method co-existing with sibling instance method: the static
// method's key-side walk must not poison the cache for the sibling instance method's body
// walk. cross-member cache invariant
class C {
  static K = "k";
  items = [1, 2, 3];
  static [C.K]() { return "static"; }
  inst() { return this.items.at(0); }
}
new C().inst();
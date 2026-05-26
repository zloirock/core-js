// computed-key getter (accessor): same as method case - the getter shape goes through
// the same cache key, body-side narrow must survive the key-side walk's null result
class C {
  static K = "val";
  items = [1, 2, 3];
  get [C.K]() { return this.items.at(0); }
}
new C()["val"];
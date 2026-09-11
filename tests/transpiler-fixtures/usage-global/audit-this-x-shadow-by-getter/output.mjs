// `get at()` is a class own member that shadows `this.at` on instances, so dispatch must
// suppress `es.array.at` / `es.string.at` - the user's getter is what runs at runtime.
class C extends Array {
  get at() {
    return -1;
  }
  foo() {
    return this.at(0);
  }
}
new C().foo();
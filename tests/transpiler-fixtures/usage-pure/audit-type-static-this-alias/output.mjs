import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an ALIASED static-context `this` is the constructor value, not an instance: the instance
// narrow rewrote `class C extends Array` static aliases to instance helpers (native TypeError
// became silent undefined). instance aliases keep the precise narrow
class C extends Array {
  static make() {
    const self = this;
    return self.at(1);
  }
  grab() {
    const self = this;
    return _atMaybeArray(self).call(self, 1);
  }
}
new C().grab(C.make);
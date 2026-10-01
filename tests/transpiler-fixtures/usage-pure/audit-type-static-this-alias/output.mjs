import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an ALIASED static-context `this` is the constructor value, not an instance: the instance
// narrow rewrote `class C extends Array` static aliases to instance helpers (native TypeError
// became silent undefined). instance aliases keep the precise narrow - which requires the class
// binding to stay put: handing `C.make` to an unknown callee would extract a rebindable method and
// leave `this` unprovable, degrading the contrast row to the generic helper
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
C.make();
new C().grab();
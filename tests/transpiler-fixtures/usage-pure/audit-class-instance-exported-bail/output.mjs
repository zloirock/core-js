import _at from "@core-js/pure/actual/instance/at";
// `export const inst = new C()` exposes the instance to importers who may mutate `inst.box`.
// The closure narrow on `this.box` must be abandoned because the export channel is an alias-leak path.
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
export const inst = new C();
inst.first();
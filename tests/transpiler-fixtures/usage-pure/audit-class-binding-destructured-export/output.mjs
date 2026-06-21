import _at from "@core-js/pure/actual/instance/at";
// `export const { C: ExportedC } = wrapper` exposes the class VALUE via the `ExportedC` import
// name even though local binding `C` is not in the export specifier list; an importer can then
// mutate `ExportedC.prototype`, affecting instance reads. the closure walker must treat C's
// wrapper-property-value position as a leak, disabling narrow so the generic polyfill ships
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const wrapper = {
  C
};
export const {
  C: ExportedC
} = wrapper;
function probe() {
  const c = new C();
  return c.getFirst();
}
probe();
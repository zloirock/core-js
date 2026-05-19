import _at from "@core-js/pure/actual/instance/at";
// `export const { C: ExportedC } = wrapper` exposes the class VALUE via the `ExportedC`
// import name, even though local binding `C` isn't itself in the export specifier list.
// importers do `import { ExportedC } from 'mod'; ExportedC.prototype.items = "evil"` or
// install a setter on the prototype - both routes affect instance reads downstream.
// the class-binding escape gate must detect this via the closure walker (the wrapper
// object-property-value position fires 'leak' in classBindingRefClassifier). without
// the gate, narrow keeps the initial Array type from the field initializer and emits
// the type-specific polyfill unsoundly. with the gate, narrow disables and the generic
// polyfill ships
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
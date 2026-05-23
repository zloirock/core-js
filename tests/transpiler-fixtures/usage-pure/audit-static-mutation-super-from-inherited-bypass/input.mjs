// `super.X` shape companion to the `this.X` static-mutation bypass fixture. `super.from(arr)`
// in a static method of `class C extends Array` resolves via inherited-static lookup with the
// same pre-remap null `meta.object`; identical re-check after remap is required
Array.from = () => 'custom';
class C extends Array {
  static use(arr) { return super.from(arr); }
}
C.use([1, 2, 3]);

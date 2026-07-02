// `super.X` companion to the `this.X` static-mutation bypass fixture. `super.from(arr)` in a STATIC
// method of `class C extends Array` resolves via inherited-static lookup with the same pre-remap null
// `meta.object`; the post-remap mutated-static check fires the same way, so the call is left native
// (no import) and the user's monkey-patch is respected. empty rewrite is correct
Array.from = () => 'custom';
class C extends Array {
  static use(arr) {
    return super.from(arr);
  }
}
C.use([1, 2, 3]);
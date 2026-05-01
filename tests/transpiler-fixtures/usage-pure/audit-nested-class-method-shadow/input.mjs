// nested class declarations inside a sibling polyfill-receiver init: `class Outer` has
// a class field whose initializer contains `class Inner` with its own method. method
// names are NOT runtime references - `isNonReferencePosition` covers method-key positions.
// also exercises the case where a class field expression contains another class
const { Array: { from } } = globalThis, y = (() => {
  class Outer {
    static Inner = class {
      from() { return 'inner-from'; }
    };
  }
  return new Outer.Inner().from();
})();
export { from, y };

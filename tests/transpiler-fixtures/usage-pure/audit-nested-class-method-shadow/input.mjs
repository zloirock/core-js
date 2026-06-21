// nested class declarations inside a sibling polyfill-receiver init: `class Outer` has
// a class field whose initializer contains `class Inner` with its own method. the inner
// `from` method KEY is a non-reference position, so it must not be mistaken for a use of
// the destructured `from`. also exercises a class field expression containing another class
const { Array: { from } } = globalThis, y = (() => {
  class Outer {
    static Inner = class {
      from() { return 'inner-from'; }
    };
  }
  return new Outer.Inner().from();
})();
export { from, y };

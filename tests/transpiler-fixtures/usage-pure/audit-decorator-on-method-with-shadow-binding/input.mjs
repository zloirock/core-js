// decorator argument referencing identifier shadowed by local class binding inside the
// IIFE-evaluated decorator scope. the `Promise` symbol in `dec(Promise.resolve(0))` is
// read from the OUTER scope (decorator expressions don't have access to class-body
// bindings) - global Promise should polyfill normally.
function build() {
  class C {
    @dec(Promise.resolve(0))
    method() {
      const Promise = null;
      return Promise;
    }
  }
  return C;
}

// IIFE-callee receiver `f().Array.from(...)` where `f` is conditionally reassigned. on the c-falsy
// path f still returns globalThis, so f().Array.from is reachable - usage-global must inject
// es.array.from (and es.global-this for the surviving proxy-global leaf). the inline-callee resolver
// is now method-aware; usage-pure bails. matches the direct-alias case in resolveVariableBindingToGlobal.
function f(c) {
  let g = () => globalThis;
  if (c) {
    g = () => globalThis;
  }
  return g().Array.from([1, 2, 3]);
}

import _at from "@core-js/pure/actual/instance/at";
// a separate `export { f }` specifier (not a declaration-level export) still makes the function
// escape the module - an external caller can pass any argument, so the defaulted param resolves to
// the generic helper. babel records the specifier as a reference; oxc must detect the export form
function f(x = [1, 2, 3]) {
  return _at(x).call(x, 0);
}
export { f };
// a separate `export { f }` specifier (not a declaration-level export) still makes the function
// escape the module - an external caller can pass any argument, so the defaulted param resolves to
// the generic helper. babel records the specifier as a reference; oxc must detect the export form
function f(x = [1, 2, 3]) {
  return x.at(0);
}
export { f };

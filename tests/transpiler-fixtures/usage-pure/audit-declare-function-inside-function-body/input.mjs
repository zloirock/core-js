// `declare function` inside a function body: ambient binding in a nested scope. the
// ambient walk drills through the function-body block down to the statement array.
// without this, `g().at(0)` falls back to the generic helper instead of the array-
// narrowed one (the declared `number[]` return type would be lost)
function f() {
  declare function g(): number[];
  return g().at(0);
}

// `let o = first; o = second;` reassigns the binding `o` but does NOT mutate the FIRST
// literal - its AST node and its own `arr` slot stay unchanged. methods on the first
// literal still bind `this` to the first literal at call time. closure walker classifies
// `o = newValue` AssignmentExpression on the binding name as a trivial ref (rebinding
// doesn't mutate the anchored value), and the first literal narrows on its init alone.
// the second literal is anonymous (RHS of AssignmentExpression, no binding) and partial-
// scans on its own init `"stringified"` -> `_atMaybeString`
let o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
o = {
  arr: "stringified",
  test() {
    return this.arr.at(0);
  }
};
o.test();

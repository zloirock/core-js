// destructuring-default desugar with `_ref` typed as a string-or-array union. fold
// (number[], string | number[] | undefined) yields a mixed-constructor type which
// commonType collapses to null - caller falls back to the standard ternary union
// fold and ultimately to the generic instance helper. proves the resolver does NOT
// short-circuit to the default's type when the ref slot could carry a string at runtime
function fn(_ref?: string | number[]) {
  var arr = _ref !== void 0 ? _ref : [1, 2, 3];
  return arr.at(0);
}
export { fn };

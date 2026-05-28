import _at from "@core-js/pure/actual/instance/at";
// mixed value-union (`string | number[]`) - folded dispatch must stay generic since
// `.at` has incompatible semantics across branches
function f<T extends { a: string; b: number[] }>(t: T, k: keyof T) {
  var _ref;
  return _at(_ref = t[k]).call(_ref, 0);
}
f({ a: 'x', b: [1] }, 'a');
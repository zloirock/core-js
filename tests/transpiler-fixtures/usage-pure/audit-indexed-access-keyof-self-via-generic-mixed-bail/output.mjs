import _at from "@core-js/pure/actual/instance/at";
// mixed value-union (`string | number[]`) - folded dispatch must stay generic since
// `.at` has incompatible semantics across branches
function f<T extends {
  a: string;
  b: number[];
}>(t: T, k: keyof T) {
  var _ref;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _at(_ref = t[k]).call(_ref, 0);
}
f({
  a: 'x',
  b: [1]
}, 'a');
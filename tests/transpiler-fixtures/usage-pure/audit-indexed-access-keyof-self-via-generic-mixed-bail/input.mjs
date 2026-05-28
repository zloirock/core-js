// mixed value-union (`string | number[]`) - folded dispatch must stay generic since
// `.at` has incompatible semantics across branches
function f<T extends { a: string; b: number[] }>(t: T, k: keyof T) {
  return t[k].at(0);
}
f({ a: 'x', b: [1] }, 'a');

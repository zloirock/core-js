// shadowed: `at` is a function parameter, not a string alias. TS-wrapper peel must not
// trigger a spurious polyfill — resolveKey's alias-follow returns null for parameter bindings
function f(at: string, arr: number[]) {
  return arr[(at) as any];
}

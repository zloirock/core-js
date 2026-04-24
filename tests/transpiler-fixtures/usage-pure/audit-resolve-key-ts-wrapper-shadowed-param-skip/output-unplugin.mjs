// `at` here is a local function parameter, not a string alias for the `.at` method,
// so no polyfill must be injected even after peeling the `as any` wrapper
function f(at: string, arr: number[]) {
  return arr[(at) as any];
}
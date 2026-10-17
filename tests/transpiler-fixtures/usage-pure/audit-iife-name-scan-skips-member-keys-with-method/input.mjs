// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const withMethod = (function f({ from, ...rest } = Array) {
  class C { f() {} }
  return [from, rest, C];
})();
export { withMethod };

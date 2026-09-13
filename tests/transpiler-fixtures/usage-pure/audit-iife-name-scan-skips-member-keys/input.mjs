// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const withMethod = (function f({ from, ...rest } = Array) {
  class C { f() {} }
  return [from, rest, C];
})();
const withField = (function g({ of, ...rest } = Array) {
  class C { g = 1; }
  return [of, rest, C];
})();
const withAccessor = (function h({ entries, ...rest } = Object) {
  class C { get h() { return 1; } }
  return [entries, rest, C];
})();
const withStatic = (function k({ keys, ...rest } = Object) {
  class C { static k() {} }
  return [keys, rest, C];
})();
const withObjectMethod = (function m({ values, ...rest } = Object) {
  const o = { m() {} };
  return [values, rest, o];
})();
const withMemberTail = (function n({ fromEntries, ...rest } = Object) {
  const o = {};
  o.n = 1;
  return [fromEntries, rest, o];
})();
const withRecursion = (function r({ groupBy, ...rest } = Object) {
  return globalThis.never ? r({ groupBy: null }) : [groupBy, rest];
})();
export { withMethod, withField, withAccessor, withStatic, withObjectMethod, withMemberTail, withRecursion };

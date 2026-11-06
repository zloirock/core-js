const withAccessor = (function h({ entries, ...rest } = Object) {
  class C { get h() { return 1; } }
  return [entries, rest, C];
})();
export { withAccessor };

const withField = (function g({ of, ...rest } = Array) {
  class C { g = 1; }
  return [of, rest, C];
})();
export { withField };

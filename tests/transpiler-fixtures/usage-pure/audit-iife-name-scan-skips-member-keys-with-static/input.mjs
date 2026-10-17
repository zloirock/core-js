const withStatic = (function k({ keys, ...rest } = Object) {
  class C { static k() {} }
  return [keys, rest, C];
})();
export { withStatic };

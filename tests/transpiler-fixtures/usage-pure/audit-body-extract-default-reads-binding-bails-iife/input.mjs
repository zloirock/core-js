// A later parameter default sees the first binding, including the fallback for an omitted argument.
(function g({ of, dflt = of, ...rest } = Array) {
  return [of, dflt, rest];
})();

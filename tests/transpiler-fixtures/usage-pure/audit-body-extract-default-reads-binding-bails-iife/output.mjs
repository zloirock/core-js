import _Array$of from "@core-js/pure/actual/array/of";
// A later parameter default sees the first binding, including the fallback for an omitted argument.
(function g({
  of = arguments.length && arguments[0] !== void 0 ? void 0 : _Array$of,
  dflt = of,
  ...rest
} = Array) {
  return [of, dflt, rest];
})();
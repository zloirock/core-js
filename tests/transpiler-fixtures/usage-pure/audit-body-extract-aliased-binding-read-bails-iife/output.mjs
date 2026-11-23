import _Array$from from "@core-js/pure/actual/array/from";
// A later parameter default sees the first binding, including the fallback for an omitted argument.
(function make({
  from: alias = arguments.length && arguments[0] !== void 0 ? void 0 : _Array$from,
  dup = alias,
  ...rest
} = Array) {
  return [alias([1]), dup, rest];
})();
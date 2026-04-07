import _Array$from from "@core-js/pure/actual/array/from";
(function ({
  from = _Array$from,
  ...rest
}) {
  return [from, rest];
})(Array);
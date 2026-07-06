import _Array$from from "@core-js/pure/actual/array/from";
// a consumed STRING-LITERAL key next to `...rest` in a param-default destructure: the
// rest-exclusion sentinel must re-emit the key with its quotes (a bare `.name` read is
// undefined for literal keys and would leak the consumed prop into rest)
function g({
  'from': _unused,
  ...rest
} = Array) {
  let f = _Array$from;
  return [f([1]), rest];
}
g();
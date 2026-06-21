import _Array$of from "@core-js/pure/actual/array/of";
// a LATER parameter's default reads the destructured binding of an earlier param (`y = of`).
// body-extract of `of` would relocate it into the body, stranding `y`'s param-scope read. the
// read is detected across the WHOLE parameter list, not just the same pattern, so the emitter
// bails to inline-default. immediately-invoked twin: emission sound, single call site visible.
(function h({
  of = _Array$of,
  ...rest
} = Array, y = of) {
  return [of, rest, y];
})();
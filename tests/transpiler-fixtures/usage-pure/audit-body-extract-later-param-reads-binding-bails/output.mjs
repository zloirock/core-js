import _Array$of from "@core-js/pure/actual/array/of";
// a LATER parameter's default reads the destructured binding of an earlier param (`y = of`).
// body-extract of `of` would relocate it into the body, stranding the param-scope read in
// `y`'s default. the read is detected across the whole parameter list, not just the same
// pattern, so the emitter bails to inline-default and keeps `of` bound in the destructure
function h({
  of = _Array$of,
  ...rest
} = Array, y = of) {
  return [of, rest, y];
}
h();
import _Array$from from "@core-js/pure/actual/array/from";
export function read(pick) {
  // Only undefined selects the parameter default; the other arm keeps its own value.
  return (({
    from,
    missing = 9
  } = {
    from: _Array$from,
    missing: Array.missing
  }) => [from([7])[0], missing])(pick ? void 0 : {
    from: _Array$from,
    missing: Array.missing
  });
}
export function nullable(pick) {
  return (({
    from
  } = Array) => from([8]))(pick ? null : {
    from: _Array$from
  });
}
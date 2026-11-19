import _Array$from from "@core-js/pure/actual/array/from";
// Only undefined selects the parameter receiver default; null still fails its property read.
// A supplied realm constructor and the default retain their own pure extraction paths.
export function read(pick) {
  // Only undefined selects the parameter default; the other arm keeps its own value.
  return (({
    from,
    missing = 9
  } = (Array, {
    from: _Array$from,
    get missing() {
      return Array.missing;
    }
  })) => [from([7])[0], missing])(pick ? void 0 : {
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
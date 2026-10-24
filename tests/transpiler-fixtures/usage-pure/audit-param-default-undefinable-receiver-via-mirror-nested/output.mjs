import _Array$of from "@core-js/pure/actual/array/of";
// nested mirror, plain optional deep nav receiver
export function viaMirrorNested({
  Array: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
}) {
  return of;
}
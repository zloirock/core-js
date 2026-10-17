import _Array$of from "@core-js/pure/actual/array/of";
// nested mirror, sealed receiver
export function viaMirrorSealed({
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
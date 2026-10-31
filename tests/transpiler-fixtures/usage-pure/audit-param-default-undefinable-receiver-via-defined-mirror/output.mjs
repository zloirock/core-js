import _Array$of from "@core-js/pure/actual/array/of";
export function viaDefinedMirror({
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
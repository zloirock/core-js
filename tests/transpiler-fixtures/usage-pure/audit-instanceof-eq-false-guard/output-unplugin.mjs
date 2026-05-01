import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function pick(input: unknown) {
  if ((input instanceof Array) === false) {
    return null;
  }
  return _atMaybeArray(input).call(input, 0);
}
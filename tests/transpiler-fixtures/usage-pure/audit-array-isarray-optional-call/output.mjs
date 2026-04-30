import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function take(input: unknown) {
  if (Array.isArray?.(input)) {
    return _atMaybeArray(input).call(input, 0);
  }
  return null;
}
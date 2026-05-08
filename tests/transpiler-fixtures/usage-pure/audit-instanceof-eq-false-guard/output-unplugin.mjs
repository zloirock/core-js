import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `(input instanceof Array) === false` is the negated form of `!instanceof`. the
// guard must narrow `input` to Array on the early-return's opposite branch
function pick(input: unknown) {
  if ((input instanceof Array) === false) {
    return null;
  }
  return _atMaybeArray(input).call(input, 0);
}
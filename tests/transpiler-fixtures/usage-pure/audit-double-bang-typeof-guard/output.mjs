import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function take(input: unknown) {
  if (!!(typeof input === 'string')) {
    return _atMaybeString(input).call(input, 0);
  }
}
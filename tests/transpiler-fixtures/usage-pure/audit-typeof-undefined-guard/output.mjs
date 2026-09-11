import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// nested typeof guards: outer `!== 'undefined'` narrows away nullish, inner
// `=== 'string'` narrows further. dispatch at `input.at(0)` must use string-aware
// polyfill, the outer guard alone wouldn't be specific enough
function take(input: unknown) {
  if (typeof input !== 'undefined') {
    if (typeof input === 'string') {
      return _atMaybeString(input).call(input, 0);
    }
  }
  return null;
}
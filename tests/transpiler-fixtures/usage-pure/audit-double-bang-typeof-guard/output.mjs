import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `!!(typeof input === 'string')` is a double-negated boolean check that's
// equivalent to the bare typeof guard. narrowing must still apply on the success
// branch so `input.at(0)` dispatches string-aware
function take(input: unknown) {
  if (!!(typeof input === 'string')) {
    return _atMaybeString(input).call(input, 0);
  }
}
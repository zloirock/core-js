import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// odd number of `!` operators flips the polarity, so `!!!(typeof x === 'string')`
// narrows the early-exit branch the same as `!(typeof x === 'string')`. confirms the
// negation peel tracks parity across any prefix of consecutive `!` operators
function take(input: unknown) {
  if (!!!(typeof input === 'string')) return null;
  return _atMaybeString(input).call(input, 0);
}
export { take };
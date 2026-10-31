// A key on an opted-out line of a mirrored parameter default reads as the source does inside the literal,
// whichever spelling opts it out; its siblings still take their ponyfills.
export function f({
  [Symbol.iterator]: it,
  hasOwn, // core-js-disable-line
} = Object) {
  return [it, hasOwn];
}
export function g({
  from,
  // core-js-disable-next-line
  of,
} = Array) {
  return [from, of];
}

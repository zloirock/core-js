// body-extract for the bare shorthand `{from}` with a rest sibling: emits `let from = _polyfill;`
// at body top and rewrites the prop value to `_unused` so the destructure still consumes the key
// (rest exclusion preserved). complementary leaf to the aliased / default-value variants. these
// functions are EXPORTED so callers are invisible: params stay VERBATIM, body-extract proven by the iife twin.
function run({
  from,
  ...rest
} = Array) {
  return [from([1]), rest];
}
function emit({
  of,
  ...rest
} = Array) {
  return [of(2, 3), rest];
}
export { run, emit };
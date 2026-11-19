// two function params each carrying a polyfilled prop + rest sibling - both bail to body-extract.
// the emitted `let from` / `let keys` must follow SOURCE order, not the reverse order a fixed
// body-top anchor would stack them in, matching unplugin byte-for-byte. these functions are
// EXPORTED so callers are invisible: params stay VERBATIM, body-extract proven by the iife twin.
function run({
  from,
  ...rest1
} = Array, {
  keys,
  ...rest2
} = Object) {
  return [from([1]), keys({}), rest1, rest2];
}
export { run };
// Unserved slots keep their native read; a null receiver rejects before the pattern key.
export function optional({ [(effect(), 'of')]: of, length } = globalThis.window?.self.Array) {
  return [of, length];
}
export function optedOut({
  from,
  // core-js-disable-next-line
  of,
} = Array) {
  return [from, of];
}
// The instance dispatcher and the retained length share one evaluated array.
const key = 'length';
export function instance({ at, [key]: length } = [7]) {
  return [at, length];
}

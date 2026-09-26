// Each claimed sibling dispatches separately; custom undefined slots retain their defaults.
export function read(shim) {
  let from, of;
  const host = { from, of = fallback() } = shim || Array;
  return [host, from, of];
}

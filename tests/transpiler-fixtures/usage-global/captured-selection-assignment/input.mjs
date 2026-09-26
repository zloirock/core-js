// Capturing into an existing binding preserves the receiver and the static polyfill.
export function read(shim) {
  let of, host;
  host = { of } = shim ?? Array;
  return [host, of];
}

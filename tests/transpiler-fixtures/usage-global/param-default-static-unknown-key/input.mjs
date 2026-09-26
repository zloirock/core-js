// An open caller set and an unknown key keep the default receiver native.
// Supplied properties and independent reads cannot be replaced by a mirror.
export function read(key, { from, [key]: other } = Array) {
  return [from, other];
}

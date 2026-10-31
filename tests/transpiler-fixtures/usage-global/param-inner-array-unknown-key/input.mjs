// An unknown key also prevents a mirror at an inner array default.
export function read(key, [{ at, [key]: other } = [7]] = []) {
  return [at, other];
}

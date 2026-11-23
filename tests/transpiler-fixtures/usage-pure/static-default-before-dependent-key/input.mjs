export function read({ from, [note(typeof from)]: other } = Array) {
  return [from, other];
}

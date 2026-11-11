// Splitting a sibling revisits the positional claim on its new receiver.
export function read(obj) {
  const { list: [{ at }], y } = obj;
  return [at, y];
}

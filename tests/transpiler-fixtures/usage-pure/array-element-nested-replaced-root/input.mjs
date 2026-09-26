// A later element can replace the root binding, but not the value already captured.
export function read() {
  let box = { y: { at: 1 } };
  const [{ y: { at } }, tail] = [box, (box = { y: { at: 9 } })];
  return [at, tail.y.at];
}

export function fromBox(source) {
  let box;
  [box = { Array: { of: x => x } }] = [source];
  return box.Array.of(3);
}

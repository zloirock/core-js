// Capture a nested receiver before evaluating its computed hop, even for one leaf.
// The receiver runs once; instance leaves beside object rest keep their native boundary.
function read(source, key) {
  const { [(key(), 'data')]: { at } } = source;
  return at;
}
function readSiblings(source, key) {
  const { before, [(key(), 'data')]: { includes, ...rest }, after } = source;
  return [before, includes, rest, after];
}

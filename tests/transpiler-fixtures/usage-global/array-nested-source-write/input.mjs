// A later array element can replace the source name after its object was selected.
// Nested method reads retain the selected element and their original order.
export function read(source, replacement) {
  const [{ w: { values }, y: { at } }] = [source, source = replacement];
  return [values, at];
}

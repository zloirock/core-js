// The native sibling still reads the hop and coerces its value.
export function read(rows) {
  const [{ hop: { at, spare: {} } }] = rows;
  return at;
}

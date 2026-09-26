// Native properties retain their source position between independent positional reads.
export function read(rows) {
  const [{ at: first, other, at: second, includes }] = rows;
  return [first, other, second, includes];
}
export function nested(rows) {
  const [{ y: { other, at } }] = rows;
  return [other, at];
}

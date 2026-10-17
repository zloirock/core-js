// An iterator-keyed pattern inside an array reads its captured element once.
// The nested default and following sibling retain their native read order.
export function read(source) {
  const [{ [Symbol.iterator]: { missing = fallback() }, tail }] = [source];
  return [missing, tail];
}

// Each iterator occurrence reads independently, in source order with native and instance siblings.
export function read(receiver) {
  const [{ [Symbol.iterator]: first, other, at, [Symbol.iterator]: second }] = [receiver];
  return [first, other, at, second];
}

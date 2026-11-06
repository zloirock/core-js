// The static reads and the computed key remain in order, including a dynamic native sibling.
export function read(effect, key) {
  const { Array: { from, [(effect(), 'of')]: of, [key]: value } } = globalThis;
  return [from, of, value];
}

export function read(effect) {
  const { Array: { from, [(effect(), 'of')]: of, custom: value } } = globalThis;
  return [from, of, value];
}

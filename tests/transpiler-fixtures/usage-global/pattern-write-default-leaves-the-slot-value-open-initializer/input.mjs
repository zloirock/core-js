export function initializer() {
  let list = [3, 4];
  const settled = (({ a: list = 'ab'[Symbol.iterator]() } = { a: undefined }), 0);
  return [settled, list.map(x => x)];
}

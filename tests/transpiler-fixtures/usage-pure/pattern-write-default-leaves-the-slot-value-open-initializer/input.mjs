export function initializer() {
  let list = [3, 4];
  const settled = (({ a: list = 'ab' } = { a: undefined }), 0);
  return [settled, list.at(-1)];
}

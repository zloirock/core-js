export function nested() {
  let list = [3, 4];
  ({ a: { b: list = 'ab' } } = { a: { b: undefined } });
  return list.at(-1);
}

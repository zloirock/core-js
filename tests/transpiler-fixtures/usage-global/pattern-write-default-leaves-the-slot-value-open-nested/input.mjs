export function nested() {
  let list = [3, 4];
  ({ a: { b: list = [1].keys() } } = { a: { b: undefined } });
  return list.filter(x => x);
}

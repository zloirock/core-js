export function control() {
  let list = 'ab';
  ({ a: list } = { a: [1] });
  return list.at(-1);
}

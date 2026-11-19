export function undefinedSlot() {
  let list = [3, 4];
  ({ a: list = 'ab' } = { a: undefined });
  return list.includes(3);
}

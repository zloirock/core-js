export function element() {
  let list = [3, 4];
  [list = 'ab'] = [undefined];
  return list.at(-1);
}

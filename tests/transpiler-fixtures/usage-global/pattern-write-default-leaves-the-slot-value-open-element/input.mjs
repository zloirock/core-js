export function element() {
  let list = [3, 4];
  [list = [1].values()] = [undefined];
  return list.find(x => x);
}

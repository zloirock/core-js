import _at from "@core-js/pure/actual/instance/at";
export function element() {
  let list = [3, 4];
  [list = 'ab'] = [undefined];
  return _at(list).call(list, -1);
}
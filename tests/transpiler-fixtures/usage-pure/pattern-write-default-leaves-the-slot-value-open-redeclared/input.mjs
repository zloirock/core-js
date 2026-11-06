export function redeclared() {
  var list = [3, 4];
  var { a: list = 'ab' } = { a: undefined };
  return list.at(-1);
}

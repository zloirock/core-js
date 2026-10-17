export function redeclared() {
  var list = [3, 4];
  var { a: list = [1].entries() } = { a: undefined };
  return list.flatMap(x => [x]);
}

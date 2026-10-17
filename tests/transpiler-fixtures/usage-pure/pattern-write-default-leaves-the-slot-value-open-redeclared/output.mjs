import _at from "@core-js/pure/actual/instance/at";
export function redeclared() {
  var list = [3, 4];
  var {
    a: list = 'ab'
  } = {
    a: undefined
  };
  return _at(list).call(list, -1);
}
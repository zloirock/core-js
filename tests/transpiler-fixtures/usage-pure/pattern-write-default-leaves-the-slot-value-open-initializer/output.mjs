import _at from "@core-js/pure/actual/instance/at";
export function initializer() {
  let list = [3, 4];
  const settled = ({
    a: list = 'ab'
  } = {
    a: undefined
  }, 0);
  return [settled, _at(list).call(list, -1)];
}
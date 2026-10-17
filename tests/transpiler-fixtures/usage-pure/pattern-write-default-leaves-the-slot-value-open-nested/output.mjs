import _at from "@core-js/pure/actual/instance/at";
export function nested() {
  let list = [3, 4];
  ({
    a: {
      b: list = 'ab'
    }
  } = {
    a: {
      b: undefined
    }
  });
  return _at(list).call(list, -1);
}
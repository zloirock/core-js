import _at from "@core-js/pure/actual/instance/at";
export function undefinedSlot() {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: undefined
  });
  return _at(list).call(list, -1);
}
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
export function control() {
  let list = 'ab';
  ({
    a: list
  } = {
    a: [1]
  });
  return _atMaybeArray(list).call(list, -1);
}
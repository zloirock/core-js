import _atMaybeArray from "@core-js/pure/actual/array/prototype/at";
export function takeArguments(...{
  at = _atMaybeArray
}) {
  return at.call([2], -1);
}
export function takeTail([first, ...{
  at = _atMaybeArray
}] = [1, 2]) {
  return at.call([first], -1);
}
export function takeRow(rows) {
  for (const [first, ...{
    at = _atMaybeArray
  }] of rows) return at.call([first], -1);
}
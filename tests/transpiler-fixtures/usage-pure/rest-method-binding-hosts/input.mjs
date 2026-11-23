export function takeArguments(...{ at }) {
  return at.call([2], -1);
}
export function takeTail([first, ...{ at }] = [1, 2]) {
  return at.call([first], -1);
}
export function takeRow(rows) {
  for (const [first, ...{ at }] of rows) return at.call([first], -1);
}

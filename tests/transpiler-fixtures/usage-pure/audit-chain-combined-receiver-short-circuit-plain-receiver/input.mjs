// NEGATIVE: no live `?.` in the receiver - the helper's own member read must throw
export function plainReceiver(arr) {
  return arr.flat?.().map(x => x).length;
}

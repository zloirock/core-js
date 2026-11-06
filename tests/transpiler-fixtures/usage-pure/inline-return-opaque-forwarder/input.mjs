// A transparent forwarder hands on the inner loop's returns as candidates: pure guards the
// static read after both calls on them, and global injects for the possible Map.
function inner() {
  while (flag) return Map;
  return custom;
}
function outer() {
  return inner();
}
export const value = outer().groupBy([1, 2, 3], value => value % 2);

// A transparent forwarder does not make the inner loop's return attributable.
// Keep the namespace needed by the unresolved static read after both calls.
function inner() {
  while (flag) return Map;
  return custom;
}
function outer() {
  return inner();
}
export const value = outer().groupBy([1, 2, 3], value => value % 2);

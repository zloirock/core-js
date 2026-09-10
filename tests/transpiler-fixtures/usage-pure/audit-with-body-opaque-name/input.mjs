// a `with` head puts an object environment between its body and every binding declared OUTSIDE the
// statement, so a read there may answer off that object: the narrow bails to the generic dispatch,
// where the array `at` alone would leave the string half of the family uninjected. the negative
// pins the boundary - a lexical declaration inside the body sits below that environment and is
// reached only from it, so it keeps its own narrow
const outer = [1, 2];
with (host) {
  outer.at(0);
}
with (host) {
  const inner = [1, 2];
  inner.includes(1);
}

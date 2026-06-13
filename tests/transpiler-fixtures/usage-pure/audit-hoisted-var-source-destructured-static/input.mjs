function f(cond) {
  if (cond) {
    var G = Array;
  }
  const { from } = G;
  return from([1, 2, 3]).at(0);
}

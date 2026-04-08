function f(a, b) {
  if (typeof a === typeof b) {
    return a.at(0);
  }
  return null;
}

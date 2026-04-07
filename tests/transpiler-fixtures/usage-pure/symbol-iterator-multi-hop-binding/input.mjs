function f(arr) {
  const k = Symbol.iterator;
  const m = k;
  return arr[m]();
}

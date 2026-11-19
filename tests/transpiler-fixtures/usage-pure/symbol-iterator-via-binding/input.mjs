function f(arr) {
  const k = Symbol.iterator;
  return arr[k]();
}

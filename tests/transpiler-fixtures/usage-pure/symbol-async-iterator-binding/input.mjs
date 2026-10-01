async function f(obj) {
  const k = Symbol.asyncIterator;
  return obj[k];
}

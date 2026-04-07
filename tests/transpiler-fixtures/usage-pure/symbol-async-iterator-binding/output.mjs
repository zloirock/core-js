import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
async function f(obj) {
  const k = _Symbol$asyncIterator;
  return obj[k];
}
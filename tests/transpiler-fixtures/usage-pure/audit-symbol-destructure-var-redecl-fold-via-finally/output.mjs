import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
function throughFinally() {
  try {
    throughFinally.touched = true;
  } finally {
    var fin = _Symbol$asyncIterator;
  }
  return [][fin];
}
export const viaFinally = throughFinally();
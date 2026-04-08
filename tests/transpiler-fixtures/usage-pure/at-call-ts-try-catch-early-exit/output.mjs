import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      return;
    } finally {
      doCleanup();
    }
  }
  _atMaybeArray(x).call(x, -1);
}
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      doFirst();
      return;
    } catch {
      logFailure();
    }
  }
  _atMaybeArray(x).call(x, -1);
}